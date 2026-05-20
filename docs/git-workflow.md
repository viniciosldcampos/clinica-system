# 📋 Git Workflow - Padrão do Projeto

## Estrutura de Branches

### Branch Principal
- **main** - Código em produção (sempre estável)

### Branch de Desenvolvimento
- **develop** - Integração de features (ambiente de desenvolvimento)

### Branches de Features
- **feature/nome-da-funcionalidade** - Nova funcionalidade
- **fix/nome-do-bug** - Correção de bugs
- **refactor/nome-da-refatoracao** - Refatoração de código
- **docs/nome-da-documentacao** - Documentação

## Fluxo de Trabalho

### 1. Criar nova funcionalidade

```bash
# Sempre partir da develop atualizada
git checkout develop
git pull origin develop

# Criar branch da feature
git checkout -b feature/cadastro-paciente
```

### 2. Trabalhar na feature

```bash
# Fazer alterações no código
# ...

# Adicionar arquivos
git add .

# Commit seguindo o padrão
git commit -m "feat: implementa cadastro de pacientes"

# Enviar para o GitHub
git push origin feature/cadastro-paciente
```

### 3. Finalizar feature (Pull Request)

1. Acesse o GitHub
2. Crie um Pull Request de `feature/cadastro-paciente` → `develop`
3. Descreva as mudanças
4. Aguarde revisão (se tiver equipe)
5. Faça o merge

### 4. Atualizar develop localmente

```bash
git checkout develop
git pull origin develop
```

### 5. Deploy para produção

Quando a develop estiver estável:

```bash
git checkout main
git merge develop
git push origin main
```

## Padrões de Commit

### Tipos de Commit

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: adiciona tela de login` |
| `fix` | Correção de bug | `fix: corrige validação de CPF` |
| `refactor` | Refatoração de código | `refactor: reorganiza service de consultas` |
| `style` | Alterações visuais/formatação | `style: ajusta layout do dashboard` |
| `docs` | Documentação | `docs: atualiza README` |
| `test` | Testes | `test: adiciona testes de autenticação` |
| `chore` | Configurações/build | `chore: atualiza dependências` |
| `perf` | Performance | `perf: otimiza query de listagem` |

### Formato do Commit
tipo: descrição curta em minúsculas
Descrição detalhada (opcional)

O que foi feito
Por que foi feito
Como foi implementado


### Exemplos CORRETOS ✅

```bash
git commit -m "feat: implementa cadastro de pacientes"
git commit -m "fix: corrige conflito de horários no agendamento"
git commit -m "refactor: separa regras de negócio em services"
git commit -m "docs: adiciona documentação da API"
git commit -m "test: adiciona testes unitários para AuthService"
git commit -m "style: padroniza componentes do formulário"
```

### Exemplos ERRADOS ❌

```bash
git commit -m "mudanças"
git commit -m "teste"
git commit -m "aaa"
git commit -m "update"
git commit -m "corrigindo coisas"
git commit -m "CADASTRO DE PACIENTES"
```

## Regras Importantes

1. **NUNCA** commitar diretamente na `main`
2. **SEMPRE** criar uma branch para cada feature/fix
3. **SEMPRE** partir da `develop` atualizada
4. **NUNCA** commitar arquivos do `.gitignore`
5. **SEMPRE** escrever commits descritivos
6. **SEMPRE** testar antes de fazer Push
7. **SEMPRE** fazer Pull Request para revisão

## Comandos Úteis

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Ver branches locais
git branch

# Ver branches remotas
git branch -r

# Deletar branch local (após merge)
git branch -d feature/nome

# Deletar branch remota
git push origin --delete feature/nome

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Atualizar branch local com remota
git pull origin develop

# Ver diferenças antes de commitar
git diff
```

## Protegendo Branches no GitHub

### Configurar proteção da main:

1. Vá em: Settings → Branches
2. Add rule
3. Branch name pattern: `main`
4. Marque:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
5. Save changes

## Exemplo de Fluxo Completo

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar feature
git checkout -b feature/login

# 3. Fazer alterações e commitar
git add .
git commit -m "feat: implementa autenticação JWT"

# 4. Enviar para GitHub
git push origin feature/login

# 5. Criar Pull Request no GitHub
# (via interface web)

# 6. Após aprovação, fazer merge

# 7. Voltar para develop e atualizar
git checkout develop
git pull origin develop

# 8. Deletar branch local
git branch -d feature/login
```
