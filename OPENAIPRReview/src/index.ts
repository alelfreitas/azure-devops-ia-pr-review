import * as tl from "azure-pipelines-task-lib/task";
import { Configuration, OpenAIApi } from 'openai';
import { deleteExistingComments } from './pr';
import { reviewFile } from './review';
import { getTargetBranchName } from './utils';
import { getChangedFiles } from './git';
import https from 'https';

async function run() {
  try {
    console.log(`
    _________ _______  _______  _______  _______  _______  _______  _       
\\__    _/(  ____ \\(  ____ \\(  ____ \\(  ____ )(  ____ \\(  ___  )( (    /|
   )  (  | (    \\/| (    \\/| (    \\/| (    )|| (    \\/| (   ) ||  \\  ( |
   |  |  | (__    | (__    | (__    | (____)|| (_____ | |   | ||   \\ | |
   |  |  |  __)   |  __)   |  __)   |     __)(_____  )| |   | || (\\ \\) |
   |  |  | (      | (      | (      | (\\ (         ) || |   | || | \\   |
|\\_)  )  | (____/\\| )      | (____/\\| ) \\ \\__/\\____) || (___) || )  \\  |
(____/   (_______/|/       (_______/|/   \\__/\\_______)(_______)|/    )_)
                                                                        
    `)

    console.log(`
                                                                                                        
                                                                                                    
                                                                                                    
                                                                                                    
                                              -::.....                                              
                                          -:::.............                                         
                                      --::::..................                                      
                                    --:::::......................                                   
                                 ==--:::::.........................                                 
                                =---:::::............................                               
                              ==---::::::..............................                             
                             ==----:::::................................                            
                            +==----:::::.................................                           
                           ++==----::::...................................                          
                          +++==----::::..:::-=+*******++=-:................                         
                         ++++===--:::::-*#%@@@@@@@@@@@@@@@@%#=-.............                        
                        ++++++==-:::-*@@@@@@@@@@@@@@@@@@@@@@@@@%+:..........                        
                        ++++++=-::=%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*:........                        
                        ++++++=::*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%=.......-                       
                        ++**+=::%@%%@@@#-:-*@@@@@@@@@@@@@#=:-+%@@@@@@+:.....:                       
                        +++*+-:#@%%%@@=.....-@@@@@@@@@@@#.....:%@@@@@%=.....:                       
                        +++*=:-%%##%@%=.....:%@@@@@@@@@@+......#@@@@@@*:....                        
                         +++-.=%###%@@%-...-#@@@@@@@@@@@%+...:*%@@%@@@#:....                        
                         =++=.-%###%@@@@@%%@@@@@@@@@@@@@@@@%%@@@@@%@@@*:...:                        
                          =++:.=###%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@@#=...:                         
                           =+=..+=+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@%#*#%=:..:                          
                            =+-..=+==++*#%@@@@@@@@@@@@@@@@@%#+==-=##=:.::                           
                             ++=..-#+==++++++==---=----=====---=+#+-:::-                            
                              +++-..=#*+=++++++++++===========+*=-::::                              
                                ++=:..:+##*++++++++++++===+++=-:::::                                
                                  +*+-:..:-*%@%%%%%%%%%%*=-::::::.:                                 
                                **#####*=-::..:+%%#%#+-:::---:.......                               
                             ++*#########*****+=:=*=--==--:............                             
                            ++++++++*++==--:::::+#*=.....................                           
                          ++==-----=+==--:::....-*+:.:=++++==..............                         
                        +=--:::::::-++=--::::..:+*+-.-+-:--:=:...::.........                        
                       ==::....:::-++==--::::..:-+=:.-**+=-=+:..:::::.........                      
                      ==::......::=+===--::::...-+-..:==-==*=....-::-::........                     
                     +=::.......:-  ===--:::::.:=+-:....:*-......  -::::........                    
                     +==:.......:  ====--:::.....:-...............  --:::.......                    
                     *+-:::.....   ======:::.....:-:..............  ----::...-=                     
                      *##=.....:  ====+=:::::....:-:..............:  ----:---:::                    
                     ***-:=*=:.:  ==+++--::::::..:-:...............   ==*#+-:.::                    
                     **+-:-=::-   ++**+==---:::::-=:.........:...::    +-:==-:::                    
                      #**+-:::     +***++===------=:::::::::::...:      +-:-+++                     
                          ==       +*++=--:::::::--:::...........:       ++=                        
                                    +*###+==------==--------==-:                                    
                                    +*#*********#######*+=-::..:                                    
                                    ****+=-----=*# %#*+=-:::::::                                    
                                     ##*+=--:::-=  %#*+=--:::::-                                    
                                       %#*+=====     %#*+=====                                      
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
    `)

    console.log('Validando porque fui chamado');
    if (tl.getVariable('Build.Reason') !== 'PullRequest') {
      tl.setResult(tl.TaskResult.Skipped, "Essa tarefa deveria rodar apenas quando for acionada por um PR.");
      return;
    }

    console.log('Conectando no servidor');
    let openai: OpenAIApi | undefined;
    const supportSelfSignedCertificate = tl.getBoolInput('support_self_signed_certificate');
    const apiKey = tl.getInput('api_key', true);
    const aoiEndpoint = tl.getInput('aoi_endpoint');

    if (apiKey == undefined) {
      tl.setResult(tl.TaskResult.Failed, 'Api Key em branco!');
      return;
    }

    if (aoiEndpoint == undefined) {
      const openAiConfiguration = new Configuration({
        apiKey: apiKey,
      });

      openai = new OpenAIApi(openAiConfiguration);
    }

    const httpsAgent = new https.Agent({
      rejectUnauthorized: !supportSelfSignedCertificate
    });

    let targetBranch = getTargetBranchName();

    if (!targetBranch) {
      tl.setResult(tl.TaskResult.Failed, 'Branch de destino não definida!');
      return;
    }

    console.log('Buscando arquivos alterados');
    const filesNames = await getChangedFiles(targetBranch);

    console.log('Removendo comentários anteriores');
    await deleteExistingComments(httpsAgent);

    for (const fileName of filesNames) {
      console.log(`Revisando arquivo ${fileName}`);
      await reviewFile(targetBranch, fileName, httpsAgent, apiKey, openai, aoiEndpoint)
    }

    tl.setResult(tl.TaskResult.Succeeded, "Pull Request analisado.");
  }
  catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();