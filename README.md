![freeCodeCamp image](https://github.com/freecodecamp/freeCodeCampTriviaQuiz/blob/master/images/ffc.jpeg)

# FreeCodeCamp Trivia Quiz
An Alexa developer quiz skill for the FreeCodeCamp.org community.

### The Project
This project is an Alexa skill delivering a developer Q and A session with a choice of subjects. The skill will ask ten questions on your chosen subject and mix in the correct answer with three random incorrect answers from the list of answers provided.

### Current Question set files
This repo currently comes with four question files.
- JavaScript 
- CSS
- General Programming and Networking
- Random (which is just a master file of the above three).

### Current Supported Languages
- English (US)
- English (UK)

### Testing and Debugging
You can test the quiz skill with the Alexa simulator in the Amazon developer console. If you receive a `Problem with the request-response` error:

1. Copy and paste the JSON output from the simulator into a temporary text file (Notepad, e.g.). 
2. Go back to AWS. 
3. Choose `configure test events` from the drop-down menu at the top of the screen.
4. Paste the JSON output into the form.
5. Name the test event.
6. Save.

The information provided from the test debug results can save a lot of time blindly searching for the cause of any error.

#### Voice-activated Testing
You can also test the newly developed skill with your voice-activated device. Amazon will automatically transfer your under-development skill to the [online version of the Alexa app](http://alexa.amazon.com). 

Sign in with your Amazon account and you can enable for your device just like any other skill.

### How to deploy to AWS Lambda
Complete the following steps to deploy the Trivia Quiz skill as a Lambda function:
1. Set up an [Amazon developer console account](https://developer.amazon.com/) if you do not already have one. This step is super easy if you are already signed up to an amazon account.
2. Set up an [Amazon Web Services account](https://aws.amazon.com/) if you do not already have one. You will need this account to set up a new Lambda function or to alter an existing one. 
3. Create and name a Lambda function.
4. Click on `add triggers` and from the list select `Alexa skills kit`.

![adding triggers](https://github.com/OcelotDive/FreeCodeCampTriviaQuiz/blob/master/images/awsTriggers.PNG)

5. Create an execution role from the drop-down menu. If you are creating your first function, choose `custom role` and follow the instructions.
6. If starting with this repo, click `code entry type` and select `import zip file`. Otherwise, you can use a Lambda blueprint to bootstrap the function rather than start from scratch.
7. Copy the text of your newly created function's Amazon Resource Name (ARN) at the top right of the page. 
8. Paste the ARN into your Amazon developer account's Alexa skills endpoint section to link the skill with the Lambda function. Paste the ARN into the default region field. 
9. Copy and paste the Skill ID from your developer account to your AWS account in the triggers Alexa skill kit section.
10. Add into your developer console the intents named within the function for this repo: add an AnswerIntent, and under `sample utterances` add `{Answer}` as a parameter. 
11. Under slots add a slot called Answer, and create four values 1,2,3,4 (the answers for each question the skill asks).
12. Go back to AnswerIntent and add a slot called Answer with the slot-type drop down set to Answer the slot just created. At the time of writing this built-in repeat intent may need to be added also as this is not always included by default.
13. Add utterances like `Repeat`, `Repeat please`, etc. for this intent.

![intents and slots](https://github.com/OcelotDive/FreeCodeCampTriviaQuiz/blob/master/images/slots.PNG)

14. Under Invocation set up an invocation to initiate the app when using an Echo or the Alexa simulator.
