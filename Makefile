CONTAINER_APP=ponto-facil-app
CONTAINER_NODE=ponto-facil-node
COMPOSE=docker compose
COMPOSE_PROD=docker compose -f docker-compose.prod.yml

.PHONY: up up-prod down migrate seed fresh deploy deploy-rebuild deploy-first send db thinker shell install lint

up:
	$(COMPOSE) down --remove-orphans && $(COMPOSE) up -d
	@echo "Ambiente de desenvolvimento iniciado. Frontend: http://localhost:5173"

up-prod:
	$(COMPOSE_PROD) down --remove-orphans && $(COMPOSE_PROD) up -d
	@echo "Ambiente de produção iniciado. Acesse: http://localhost"

down:
	$(COMPOSE) down

migrate:
	$(COMPOSE) exec $(CONTAINER_APP) php artisan migrate

seed:
	$(COMPOSE) exec $(CONTAINER_APP) php artisan db:seed

fresh:
	$(COMPOSE) exec $(CONTAINER_APP) php artisan migrate:fresh --seed

thinker:
	$(COMPOSE) exec $(CONTAINER_APP) php artisan tinker

db:
	$(COMPOSE) exec mysql mysql -u pontofacil -psecret pontofacil

shell:
	$(COMPOSE) exec $(CONTAINER_APP) bash

install:
	$(COMPOSE) exec $(CONTAINER_APP) composer install
	$(COMPOSE) run --rm $(CONTAINER_NODE) npm install

lint:
	npm run lint

send:
	@$(MAKE) lint || (echo "Lint falhou. Corrija os erros antes de enviar." && exit 1)
	@read -p "Mensagem do commit: " msg; \
	BRANCH="auto/$$(date +%Y%m%d-%H%M%S)"; \
	git checkout -b $$BRANCH; \
	git add -A; \
	git diff --cached --quiet && { \
		echo "Nenhuma alteração para commitar."; \
		git checkout main 2>/dev/null || git checkout master 2>/dev/null; \
		git branch -d $$BRANCH; \
		exit 0; \
	}; \
	git commit -m "$$msg"; \
	git push origin $$BRANCH; \
	MAIN=$$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"); \
	git checkout $$MAIN; \
	git merge $$BRANCH; \
	git push origin $$MAIN; \
	git branch -d $$BRANCH; \
	git push origin --delete $$BRANCH || true; \
	echo "Enviado com sucesso!"

deploy:
	git stash || true
	git pull origin main
	$(MAKE) _deploy-full

deploy-rebuild:
	$(COMPOSE_PROD) build app
	$(COMPOSE_PROD) up -d app
	$(MAKE) _deploy-full

deploy-first:
	cp docker/nginx/initial.conf docker/nginx/active.conf
	$(COMPOSE_PROD) build
	$(COMPOSE_PROD) run --rm $(CONTAINER_APP) php artisan key:generate --force
	$(MAKE) _deploy-full
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan config:cache

_deploy-full:
	@START=$$(date +%s); \
	echo ""; \
	echo "\033[1;34m[1/6]\033[0m Preparando ambiente..."; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) chmod -R 775 storage bootstrap/cache 2>/dev/null || true; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) rm -f public/hot 2>/dev/null || true; \
	\
	echo "\033[1;34m[2/6]\033[0m Instalando dependências do backend..."; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) composer install --no-dev --optimize-autoloader --no-interaction; \
	\
	echo "\033[1;34m[3/6]\033[0m Compilando frontend..."; \
	$(COMPOSE_PROD) run --rm $(CONTAINER_NODE) sh -c "npm install && npm run build" || \
		(echo "\033[1;31mBuild do frontend falhou! Deploy cancelado.\033[0m" && exit 1); \
	\
	echo "\033[1;34m[4/6]\033[0m Ativando modo de manutenção..."; \
	DOWNTIME_START=$$(date +%s); \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan down --secret="manutencao-ponto-facil" --retry=10; \
	\
	echo "\033[1;34m[5/6]\033[0m Migrações e cache..."; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan migrate --force; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan config:cache; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan route:cache; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan view:clear; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan view:cache; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan storage:link 2>/dev/null || true; \
	$(COMPOSE_PROD) up -d --force-recreate app scheduler queue; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) chmod -R 775 storage bootstrap/cache 2>/dev/null || true; \
	$(COMPOSE_PROD) exec nginx nginx -s reload; \
	\
	echo "\033[1;34m[6/6]\033[0m Saindo do modo de manutenção..."; \
	$(COMPOSE_PROD) exec $(CONTAINER_APP) php artisan up; \
	DOWNTIME_END=$$(date +%s); \
	END=$$(date +%s); \
	echo ""; \
	echo "\033[1;32mDeploy concluído!\033[0m"; \
	echo "Tempo de manutenção: $$((DOWNTIME_END - DOWNTIME_START))s | Tempo total: $$((END - START))s"; \
	echo "{\"version\":\"$$(git rev-parse --short HEAD)\",\"date\":\"$$(git log -1 --format=%ci)\"}" > public/version.json
