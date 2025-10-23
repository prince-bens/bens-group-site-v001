const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');

/**
  * Créez une évaluation pour analyser le risque d'une action dans l'interface utilisateur.
  *
  * projectID: L'ID de votre projet Google Cloud.
  * recaptchaSiteKey: La clé reCAPTCHA associée au site ou à l'application
  * token: Jeton généré auprès du client.
  * recaptchaAction: Nom d'action correspondant au jeton.
  */
async function createAssessment({
  // À FAIRE : remplacer le jeton et les variables d'action reCAPTCHA avant d'exécuter l'exemple.
  projectID = "bensnexus-4933d",
  recaptchaKey = "6Lctic8rAAAAADDTmkjZ2fXqVb5e2w1vefpV5pDX",
  token = "action-token",
  recaptchaAction = "action-name", 
}) {
  // Créez le client reCAPTCHA.
  // À FAIRE : mettre en cache le code de génération du client (recommandé) ou appeler client.close() avant de quitter la méthode.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);
 
  // Créez la demande d'évaluation.
  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });

  const [ response ] = await client.createAssessment(request);

  // Vérifiez si le jeton est valide.
  if (!response.tokenProperties.valid) {
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
    return null;
  }

  // Vérifiez si l'action attendue a été exécutée.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // Obtenez le score de risques et le ou les motifs.
    // Pour savoir comment interpréter l'évaluation, consultez les pages suivantes :
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis.score;
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return null;
  }
}