![ffc image](https://github.com/OcelotDive/FreeCodeCampTriviaQuiz/blob/master/images/ffc.jpeg)

 # FreeCodeCampTriviaQuiz
 An Alexa skill developed for the FreeCodeCamp community


### The Project
This project is an Alexa skill delivering a developer Q and A session with a choice of subjects, developed for and inspired by
FreeCodeCamp. The skill will ask ten questions on your chosen subject and mix in the correct answer with three random incorrect answers from the list of answers provided.


### Initial setup and development environment
First off setup of an Amazon developer console account is required. https://developer.amazon.com/
This is super easy if you are already signed up to an amazon account.
Next an Amazon Web Services account is also need to set up a new Lambda funtion or alter an existing one. https://aws.amazon.com/

After creating and naming a Lambda function click on add triggers and from the list select Alexa skills kit.

![adding triggers](https://github.com/OcelotDive/FreeCodeCampTriviaQuiz/blob/master/images/awsTriggers.PNG)

You will also have to create an execution role from the drop down, if it is the first time creating a function choose custom
role and follow the instructions.

If starting with this repo,  click code entry type and select import zip file, otherwise a Lambda blueprint can be used
to bootstrap the function rather than start from scratch.

Make sure to take a copy of your newly created function's Amazon Resource Name (ARN) at the top right of the page, this will need to 
be pasted into your amazon developer account alexa skills endpoint section to link the skill with the Lambda function. Copy this into the
default region field. Your Skill id will also need to be copy and pasted from your developer account to your AWS account in the  triggers Alexa skill kit section.

You will then need to add into your developer console the intents named within the function for this repo, add a AnswerIntent  and under 'sample utterances' add {Answer} as a parameter.
Then under slots add a slot called Answer, and create four values 1,2,3,4 (the answers for each question the skill asks).
Back to AnswerIntent and add a slot called Answer with the slot type drop down set to Answer the slot just created.
At the time of writing this a built in repeat intent may need to be added also as this is not always included by default.
Utterances like 'Repeat', 'Repeat please' etc will need to be added for this intent.

![intents and slots](https://github.com/OcelotDive/FreeCodeCampTriviaQuiz/blob/master/images/slots.PNG)

Finally under invocation set up an invocation to initiate the app when using an Echo or the Alexa simulator.

### Current Question set files
This repo currently comes with four question files.
Javascript 
CSS
General Programming and Networking
Random (which is just a master file of the above three).

### Current Supported Languages
English (US)
English (UK)


### Testing and Debugging
When testing with the Alexa simulator in the Amazon developer console, if you recieve a 'Problem with the request response' error.
Copy and paste the Json output from the simulator. Back in AWS choose configure test events from the drop down at the top and paste in the  Json output, name the test event and save.
The information provided from the test debug results can save a lot of time blindly searching for the cause of any error.

