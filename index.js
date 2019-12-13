/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const cssquestions = require('./question_sets/css');
const htmlquestions = require('./question_sets/html');
const javascriptquestions = require('./question_sets/javascript');
const generalquestions = require('./question_sets/general');
const randomquestions = require('./question_sets/random');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const ANSWER_COUNT = 4;
const GAME_LENGTH = 10;
const SUBJECT_COUNT = 5;
let introChoice = true;


/* jshint -W101 */
const languageString = {
  en: {
    translation: {
      QUESTIONS: randomquestions.QUESTIONS_EN_US,
      GAME_NAME: 'Free Code Camp Developer Quiz.',
      HELP_MESSAGE: 'I will ask you %s multiple choice questions on the subject of your choosing. Respond with the number of the answer. ' +
				'For example, say one, two, three, or four. To start a new game at any time, say, start game. ',
      REPEAT_QUESTION_MESSAGE: 'To repeat the last question, say, repeat. ',
      ASK_MESSAGE_START: 'Would you like to start playing?',
      HELP_REPROMPT: 'To give an answer to a question, respond with the number of the answer. ',
      STOP_MESSAGE: 'Ok, Be sure to check back soon to keep your coding skills sharp. Cheerio!',
      TRIVIA_UNHANDLED: 'Try saying a number between 1 and %s, or say repeat, to repeat the last question.',
     // HELP_UNHANDLED: 'Say yes to continue, or no to end the game.',
      START_UNHANDLED: 'Say start to start a new game.',
      NEW_GAME_MESSAGE: '',
      WELCOME_MESSAGE: 'I will ask you %s questions on, ',
      WELCOME_MESSAGE2: ', try to score as highly as possible. Just say the number of the answer. Here we go. ',
      WELCOME_MESSAGE_TOTAL: '',
      ANSWER_CORRECT_MESSAGE: 'correct. ',
      ANSWER_WRONG_MESSAGE: 'wrong. sorry! ',
      CORRECT_ANSWER_MESSAGE: 'The correct answer is %s: %s. ',
      ANSWER_IS_MESSAGE: 'That answer is ',
      TELL_QUESTION_MESSAGE: 'Question %s. %s ',
      GAME_OVER_MESSAGE: 'You answered %s out of %s questions correct. Thank you for playing!, and keep coding!',
      GAME_OVER_MESSAGE1010: 'You answered a maximum %s out of %s questions correct, with no incorrect answers, well done you. Thank you for playing!, and keep coding!',
      SCORE_IS_MESSAGE: 'Your score is %s. ',
      INTRO_MESSAGE: `Hi, and Welcome to the Free Code Camp Developer Quiz. Choose the subject you would like to test on. 
                        Just say One, for JavaScript ,two, for C s s ,three, for H t m l ,four, for General programming and networking, or five, for random mode. The default, is Random mode`
    },
  },
 
};

function introduceSubjects(handlerInput) {
  introChoice = true;
  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  let speechOutput = requestAttributes.t('INTRO_MESSAGE', requestAttributes.t('GAME_NAME'));
  let repromptText = speechOutput;
  
  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .withSimpleCard(requestAttributes.t('GAME_NAME'), repromptText)
    .getResponse();
}

function handleUserSubject (handlerInput, subjectNumber) {
 introChoice = false;
 const mess1 = languageString['en']['translation']['WELCOME_MESSAGE'];
 const mess2 = languageString['en']['translation']['WELCOME_MESSAGE2'];

  const choiceArr = [
    'JavaScript'.toLocaleLowerCase(),
    'C s s'.toLocaleLowerCase(),
    'H t m l'.toLocaleLowerCase(),
    'General and networking'.toLocaleLowerCase(),
    'Random topics'.toLocaleLowerCase()
  ];

  subjectNumber = parseInt(subjectNumber, 10);
  
  let chosenSubjectString = (choiceArr[subjectNumber - 1]) !== undefined ? choiceArr[subjectNumber - 1] : 'Random topics';

  // insert choice into welcome string
 
  languageString['en']['translation']['WELCOME_MESSAGE_TOTAL'] = `${mess1} ${chosenSubjectString} ${mess2}`;
  
  switch (subjectNumber) {
    case (1):
      languageString['en']['translation']['QUESTIONS'] = javascriptquestions['QUESTIONS_EN_US'];
      break;
    case (2):
      languageString['en']['translation']['QUESTIONS'] = cssquestions['QUESTIONS_EN_US'];
      break;
    case (3):
      languageString['en']['translation']['QUESTIONS'] = htmlquestions['QUESTIONS_EN_US'];
      break;
    case (4):
      languageString['en']['translation']['QUESTIONS'] = generalquestions['QUESTIONS_EN_US'];
      break;
    case (5):
      languageString['en']['translation']['QUESTIONS'] = randomquestions['QUESTIONS_EN_US'];
      break;
  }
  
return startGame(true, handlerInput);
}

function populateGameQuestions(translatedQuestions) {
  const gameQuestions = [];
  const indexList = [];
  let index = translatedQuestions.length;
  if (GAME_LENGTH > index) {
    throw new Error('Invalid Game Length.');
  }

  for (let i = 0; i < translatedQuestions.length; i += 1) {
    indexList.push(i);
  }

  for (let j = 0; j < GAME_LENGTH; j += 1) {
    const rand = Math.floor(Math.random() * index);
    index -= 1;

    const temp = indexList[index];
    indexList[index] = indexList[rand];
    indexList[rand] = temp;
    gameQuestions.push(indexList[index]);
  }
  return gameQuestions;
}

function populateRoundAnswers(
  gameQuestionIndexes,
  correctAnswerIndex,
  correctAnswerTargetLocation,
  translatedQuestions
) {
  const answers = [];
  const translatedQuestion = translatedQuestions[gameQuestionIndexes[correctAnswerIndex]];
  const answersCopy = translatedQuestion[Object.keys(translatedQuestion)[0]].slice();
  let index = answersCopy.length;

  if (index < ANSWER_COUNT) {
    throw new Error('Not enough answers for question.');
  }

  // Shuffle the answers, excluding the first element which is the correct answer.
  for (let j = 1; j < answersCopy.length; j += 1) {
    const rand = Math.floor(Math.random() * (index - 1)) + 1;
    index -= 1;

    const swapTemp1 = answersCopy[index];
    answersCopy[index] = answersCopy[rand];
    answersCopy[rand] = swapTemp1;
  }

  // Swap the correct answer into the target location
  for (let i = 0; i < ANSWER_COUNT; i += 1) {
    answers[i] = answersCopy[i];
  }
  const swapTemp2 = answers[0];
  answers[0] = answers[correctAnswerTargetLocation];
  answers[correctAnswerTargetLocation] = swapTemp2;
  return answers;
}

function isAnswerSlotValid(intent) {
  const answerSlotFilled = intent
    && intent.slots
    && intent.slots.Answer
    && intent.slots.Answer.value;
  const answerSlotIsInt = answerSlotFilled
    && !Number.isNaN(parseInt(intent.slots.Answer.value, 10));
  return answerSlotIsInt
    && parseInt(intent.slots.Answer.value, 10) < (ANSWER_COUNT + 1)
    && parseInt(intent.slots.Answer.value, 10) > 0;
}

function handleUserGuess(userGaveUp, handlerInput) {
  const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
  const { intent } = requestEnvelope.request;

  const answerSlotValid = isAnswerSlotValid(intent);

  let speechOutput = '';
  let speechOutputAnalysis = '';

  const sessionAttributes = attributesManager.getSessionAttributes();
  const gameQuestions = sessionAttributes.questions;
  let correctAnswerIndex = parseInt(sessionAttributes.correctAnswerIndex, 10);
  let currentScore = parseInt(sessionAttributes.score, 10);
  let currentQuestionIndex = parseInt(sessionAttributes.currentQuestionIndex, 10);
  const { correctAnswerText } = sessionAttributes;
  const requestAttributes = attributesManager.getRequestAttributes();
  const translatedQuestions = requestAttributes.t('QUESTIONS');

  if (answerSlotValid
    && parseInt(intent.slots.Answer.value, 10) === sessionAttributes.correctAnswerIndex) {
    currentScore += 1;
    speechOutputAnalysis = requestAttributes.t('ANSWER_CORRECT_MESSAGE');
  }
  else if (!answerSlotValid) {
      let speechOutput =  requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT);
      return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
    }

  else {
    if (!userGaveUp) {
      speechOutputAnalysis = requestAttributes.t('ANSWER_WRONG_MESSAGE');
    }

    speechOutputAnalysis += requestAttributes.t(
      'CORRECT_ANSWER_MESSAGE',
      correctAnswerIndex,
      correctAnswerText
    );
  }

  // Check if we can exit the game session after GAME_LENGTH questions (zero-indexed)
  if (sessionAttributes.currentQuestionIndex === GAME_LENGTH - 1) {
    speechOutput = userGaveUp ? '' : requestAttributes.t('ANSWER_IS_MESSAGE');
    const finalScoreMessage = currentScore === 10 ? 'GAME_OVER_MESSAGE1010' : 'GAME_OVER_MESSAGE';
    speechOutput += speechOutputAnalysis + requestAttributes.t(
      finalScoreMessage,
      currentScore.toString(),
      GAME_LENGTH.toString()
    );

    return responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
  currentQuestionIndex += 1;
  correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
  const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
  const roundAnswers = populateRoundAnswers(
    gameQuestions,
    currentQuestionIndex,
    correctAnswerIndex,
    translatedQuestions
  );
  const questionIndexForSpeech = currentQuestionIndex + 1;
  let repromptText = requestAttributes.t(
    'TELL_QUESTION_MESSAGE',
    questionIndexForSpeech.toString(),
    spokenQuestion
  );

  for (let i = 0; i < ANSWER_COUNT; i += 1) {
    repromptText += `${i + 1}. ${roundAnswers[i]}. `;
  }

  speechOutput += userGaveUp ? '' : requestAttributes.t('ANSWER_IS_MESSAGE');
  speechOutput += speechOutputAnalysis
    + requestAttributes.t('SCORE_IS_MESSAGE', currentScore.toString())
    + repromptText;

  const translatedQuestion = translatedQuestions[gameQuestions[currentQuestionIndex]];

  Object.assign(sessionAttributes, {
    speechOutput: repromptText,
    repromptText,
    currentQuestionIndex,
    correctAnswerIndex: correctAnswerIndex + 1,
    questions: gameQuestions,
    score: currentScore,
    correctAnswerText: translatedQuestion[Object.keys(translatedQuestion)[0]][0]
  });

  return responseBuilder.speak(speechOutput)
    .reprompt(repromptText)
    .withSimpleCard(requestAttributes.t('GAME_NAME'), repromptText)
    .getResponse();
}

function startGame(newGame, handlerInput) {

  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  let speechOutput = newGame
    ? requestAttributes.t('NEW_GAME_MESSAGE', requestAttributes.t('GAME_NAME'))
      + requestAttributes.t('WELCOME_MESSAGE_TOTAL', GAME_LENGTH.toString())
    : '';
  const translatedQuestions = requestAttributes.t('QUESTIONS');
  const gameQuestions = populateGameQuestions(translatedQuestions);
  const correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));

  const roundAnswers = populateRoundAnswers(
    gameQuestions,
    0,
    correctAnswerIndex,
    translatedQuestions
  );
  const currentQuestionIndex = 0;
  const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
  let repromptText = requestAttributes.t('TELL_QUESTION_MESSAGE', '1', spokenQuestion);
  for (let i = 0; i < ANSWER_COUNT; i += 1) {
    repromptText += `${i + 1}. ${roundAnswers[i]}. `;
  }

  speechOutput += repromptText;
  const sessionAttributes = {};

  const translatedQuestion = translatedQuestions[gameQuestions[currentQuestionIndex]];

  Object.assign(sessionAttributes, {
    speechOutput: repromptText,
    repromptText,
    currentQuestionIndex,
    correctAnswerIndex: correctAnswerIndex + 1,
    questions: gameQuestions,
    score: 0,
    correctAnswerText: translatedQuestion[Object.keys(translatedQuestion)[0]][0]
  });

  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(repromptText)
    .withSimpleCard(requestAttributes.t('GAME_NAME'), repromptText)
    .getResponse();
}

function helpTheUser(newGame, handlerInput) {
  const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  const askMessage = newGame
    ? requestAttributes.t('ASK_MESSAGE_START')
    : requestAttributes.t('REPEAT_QUESTION_MESSAGE');
  const speechOutput = requestAttributes.t('HELP_MESSAGE', GAME_LENGTH) + askMessage;
  const repromptText = requestAttributes.t('HELP_REPROMPT') + askMessage;

  return handlerInput.responseBuilder.speak(speechOutput).reprompt(repromptText).getResponse();
}

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageString,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
   // return startGame(true, handlerInput);
   return introduceSubjects(handlerInput);
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const newGame = !(sessionAttributes.questions);
    return helpTheUser(newGame, handlerInput);
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    if (Object.keys(sessionAttributes).length === 0) {
      const speechOutput = requestAttributes.t('START_UNHANDLED');
      return handlerInput.attributesManager
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } else if (sessionAttributes.questions) {
      const speechOutput = requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT.toString());
      return handlerInput.attributesManager
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
   // const speechOutput = requestAttributes.t('HELP_UNHANDLED');
   // return handlerInput.attributesManager.speak(speechOutput).reprompt(speechOutput).getResponse();
   
      const speechOutput = requestAttributes.t('STOP_MESSAGE');
      return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(speechOutput)
      .withShouldEndSession(true)      
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const AnswerIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent' 
        || handlerInput.requestEnvelope.request.intent.name === 'DontKnowIntent');
  },
  handle(handlerInput) {
      const slots = handlerInput.requestEnvelope.request.intent.slots;
      const subjectNumber = slots['Answer'].value;
    if (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent' && introChoice === true) {
      
      return handleUserSubject(handlerInput, subjectNumber);
      
    }
    if (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent' && introChoice === false) {
    
      return handleUserGuess(false, handlerInput);
    }
    else {
    return handleUserGuess(true, handlerInput);
    }
  },
};

const RepeatIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     if(introChoice) {
       const newGame = !(sessionAttributes.questions);
      return helpTheUser(newGame, handlerInput);
    }
    return handlerInput.responseBuilder.speak(sessionAttributes.speechOutput)
      .reprompt(sessionAttributes.repromptText)
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(introChoice) {
      return introduceSubjects(handlerInput);
    }
    if (sessionAttributes.questions) {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const speechOutput = requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT);
      return handlerInput.responseBuilder.speak(speechOutput)
        .reprompt(sessionAttributes.repromptText)
        .getResponse();
    }
    return startGame(false, handlerInput);
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('STOP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(speechOutput)
      .withShouldEndSession(true)      
      .getResponse();
  },
};

const CancelIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('STOP_MESSAGE');

    return handlerInput.responseBuilder.speak(speechOutput)
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
       if(introChoice) {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const speechOutput = requestAttributes.t('STOP_MESSAGE');
      return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(speechOutput)
      .withShouldEndSession(true)      
      .getResponse();
    }
     if (sessionAttributes.questions) {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const speechOutput = requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT);
      return handlerInput.responseBuilder.speak(speechOutput)
        .reprompt(sessionAttributes.repromptText)
        .getResponse();
    }
    return startGame(false, handlerInput);
   
  },

};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again. Or try saying Help, for a list of commands.')
      .reprompt('Sorry, I can\'t understand the command. Please say again. Or try saying Help, for a list of commands.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    HelpIntent,
    AnswerIntent,
    RepeatIntent,
    YesIntent,
    StopIntent,
    CancelIntent,
    NoIntent,
    SessionEndedRequest,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
