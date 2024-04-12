# OpenAI GPT para revisar Pull Requests na Azure Devops

implementado sob o código do mlarhrouch.
Uma tarefa para adicionar a revisão de PR na pipeline 

## Instalação

A instalação pode ser feita através da [Visual Studio MarketPlace](https://marketplace.visualstudio.com/items?itemName=JFTech.OPENAIPRReview).

## Como usar

Após instalar siga os passos abaixo e adicione a tarefa de review na sua pipeline.

## Setup

### De permissão de colaborar a construção 

Lembra-se de antes de adicionar a chamada dessa task, de permissão ao usuário de build (criado pelo devops no projeto) para contribuir no PR:

![contribute_to_pr](https://github.com/mlarhrouch/azure-pipeline-gpt-pr-review/blob/main/images/contribute_to_pr.png?raw=true)

### Permita a task de acessar o token do sistema

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

## License

[MIT](https://raw.githubusercontent.com/mlarhrouch/azure-pipeline-gpt-pr-review/main/LICENSE)
