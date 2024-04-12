# GPT Pull Request review Task for Azure Pipelines

Implemented over mlarhrouch code.
Uma tarefa para adicionar a revisão de PR na pipeline

## Setup

Após instalar siga os passos abaixo e adicione a tarefa de review na sua pipeline.

### De permissão de colaborar a construção

![contribute_to_pr](https://github.com/mlarhrouch/azure-pipeline-gpt-pr-review/blob/main/images/contribute_to_pr.png?raw=true)

#### Yaml pipelines 

Adicione uma seção de checkout com persistencia de credenciais.

```yaml
steps:
- checkout: self
  persistCredentials: true
```

#### Classic editors 

Habilite a opção "Allow scripts to access the OAuth token" nas propriedades do "Agent job" :

![allow_access_token](https://github.com/mlarhrouch/azure-pipeline-gpt-pr-review/blob/main/images/allow_access_token.png?raw=true)

### Azure Open AI service

Se você escolher usar o serviço Azure Open AI, você deve preencher o endpoint e chave da APi do OpenAI. O formato é: https://{XXXXXXXX}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version={API_VERSION}

### OpenAI Models

Os modelos suportados são "gpt-4", "gpt-3.5-turbo" and "gpt-3.5-turbo-16k".O padrão é "gpt-3.5-turbo".

## How to use it

### Install the extension

Para usar instale a extensão na sua organização.

### Add the task to the build pipeline

Após a instalação adicione na sua pipeline através da lista de extensões.

### Configure the task

Após adicionar a tarefa, configure com sua chave e endereço OpenAI. Você pode pegar no endereço https://platform.openai.com/account/api-keys.

### Review Pull Requests

A tarefa só incluirá comentários se for acionada por um Pull Request.

## Compativel com Linux Build Agents

A task pode ser executada em qualquer agente com linux ou macos.
