import fetch from 'node-fetch';
import { git } from './git';
import { OpenAIApi } from 'openai';
import { addCommentToPR } from './pr';
import { Agent } from 'https';
import * as tl from "azure-pipelines-task-lib/task";

export async function reviewFile(targetBranch: string, fileName: string, httpsAgent: Agent, apiKey: string, openai: OpenAIApi | undefined, aoiEndpoint: string | undefined) {
  console.log(`Start reviewing ${fileName} ...`);

  const defaultOpenAIModel = 'gpt-4';
  const patch = await git.diff([targetBranch, '--', fileName]);

  const instructions = `Atue como um revisor de código, analisando um Pull Request, dando feedback sobre possíveis bugs, erros e melhorias de código baseado em clean code.
        Você receberá as mudanças de um Pull Request no formato patch.
        Cada entrada de patch tera o commit na linha do assunto, seguida pelas mudanças de código (diffs) em uma formato unidiff.

        Como um analisador de código, sua tarefa é:
                - Revisar somente as linhas de código adicionados, editados ou deletados.
                - Se não houver bugs, e as mudanças estiverem corretas, escreva "No feedback".
                - Se existir bug ou código incorreto, não escreva "No feedback".'`;

  try {
    let choices: any;

    if (openai) {
      const response = await openai.createChatCompletion({
        model: tl.getInput('model') || defaultOpenAIModel,
        messages: [
          {
            role: "system",
            content: instructions
          },
          {
            role: "user",
            content: patch
          }
        ],
        max_tokens: 500
      });

      choices = response.data.choices
    }
    else if (aoiEndpoint) {
      const request = await fetch(aoiEndpoint, {
        method: 'POST',
        headers: { 'api-key': `${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 500,
          messages: [{
            role: "user",
            content: prompt
          }]
        })
      });

      const response = await request.json();

      choices = response.choices;
    }

    if (choices && choices.length > 0) {
      const review = choices[0].message?.content as string;

      if (review.trim() !== "No feedback.") {
        await addCommentToPR(fileName, review, httpsAgent);
      }
    }

    console.log(`Analise de ${fileName} concluída.`);
  }
  catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}