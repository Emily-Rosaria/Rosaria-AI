const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

module.exports = async function(link) {
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'google_token.json';

  // Set up doc request;
  const docID = link.split(/d\//).slice(-1)[0].split(/\//)[0];
  // Load client secrets from a local file.
  async function getLogin(docID) {
    let testJSON = fs.readFileSync('./gdocslogin.json');
    textJSON = JSON.parse(testJSON);
    if (textJSON === undefined) {
      return console.log('Error loading client secret file:', err);
    } else {
      textJSON.installed.client_secret = process.env.GOOGLE_CLIENT_SECRET;
      textJSON.installed.client_id = process.env.GOOGLE_CLIENT_ID;
      textJSON.installed.project_id = process.env.GOOGLE_PROJECT_ID;
      const docData = await authorize(textJSON, getDocFromID, docID);
      return docData;
    }
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  async function authorize(credentials, callback, docID) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);


    let docData = null;
    // parse token if it exists.
    const token = await fs.readFileSync(TOKEN_PATH);
    let tokenJSON = JSON.parse(token);
    if (tokenJSON === undefined) {
      docData = getNewToken(oAuth2Client, callback, docID);
    } else {
      tokenJSON.access_token = process.env.GOOGLE_ACCESS_TOKEN;
      tokenJSON.refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
      oAuth2Client.setCredentials(tokenJSON);
      docData = await callback(oAuth2Client,docID);
    }
    return docData;
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback, docID) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        return callback(oAuth2Client, docID);
      });
    });
  }

  /**
   * Prints the title of a sample doc:
   * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
   */
  async function getDocFromID(auth, docID) {
    const docs = google.docs({ version: 'v1', auth });
    docJ = {"documentId": docID}
    const docData = await docs.documents.get(docJ)
    .then((doc) => doc.data)
    .catch((err)=> {
      console.log('The API returned an error: ' + err);
      return null;
      });
    return docData;
  }
  const docData = await getLogin(docID);
  return docData;
};
