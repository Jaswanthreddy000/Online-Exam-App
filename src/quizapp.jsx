import React, { useState, useEffect } from 'react';
import questionsData from './questions.json';
import "./quiz.css";

function QuizApp() {
  const savedQuizState = JSON.parse(localStorage.getItem('quizState'));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    savedQuizState && !savedQuizState.showScore ? savedQuizState.currentQuestionIndex : 0
  );
  const [selectedOptions, setSelectedOptions] = useState(
    savedQuizState && !savedQuizState.showScore ? savedQuizState.selectedOptions : new Array(questionsData.length).fill('')
  );
  const [score, setScore] = useState(
    savedQuizState && !savedQuizState.showScore ? savedQuizState.score : 0
  );
  const [showScore, setShowScore] = useState(
    savedQuizState ? savedQuizState.showScore : false
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullScreenAlert, setShowFullScreenAlert] = useState(false);
  const [violationCount, setViolationCount] = useState(
    savedQuizState && !savedQuizState.showScore ? savedQuizState.violationCount : 0
  );

  useEffect(() => {
    // Check if the document is currently in full-screen mode
    const fullscreenChangeHandler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);

    // Check if the page visibility changes
    const visibilityChangeHandler = () => {
      if (!showScore && document.hidden) {
        // If the page is hidden (user switched to another tab), increment violation count
        setViolationCount(prevCount => prevCount + 1);
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, [showScore]);

  // Save quiz state to local storage on change
  useEffect(() => {
    localStorage.setItem('quizState', JSON.stringify({
      currentQuestionIndex,
      selectedOptions,
      score,
      showScore,
      violationCount
    }));
  }, [currentQuestionIndex, selectedOptions, score, showScore, violationCount]);

  // Restoring state on full screen mode change
  useEffect(() => {
    if (!isFullScreen) {
      setShowFullScreenAlert(true);
    } else {
      setShowFullScreenAlert(false);
    }
  }, [isFullScreen]);

  const handleOptionSelect = (option) => {
    if (!isFullScreen) return; // Prevent selecting options if not in full-screen mode
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = option;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    if (!isFullScreen) {
      setShowFullScreenAlert(true);
      return; // Prevent proceeding to next question if not in full-screen mode
    }

    // Check if the selected option is correct
    const correctAnswer = questionsData[currentQuestionIndex].correctAnswer;
    const selectedOption = selectedOptions[currentQuestionIndex];
    if (selectedOption === correctAnswer) {
      setScore(score + 1);
    } else if (selectedOption !== '') {
      setScore(score - 1); // Subtract score if previously selected option was correct
    }

    // Move to the next question or show the score if all questions are answered
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowScore(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const enterFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem('quizState');
    setCurrentQuestionIndex(0);
    setSelectedOptions(new Array(questionsData.length).fill(''));
    setScore(0);
    setShowScore(false);
    setViolationCount(0);
  };

  return (
    <div>
      <div className='title'>QUIZ APP</div>
      {!isFullScreen && (
        <button className="fullscreen-button" onClick={enterFullScreen}>
          Enter Full Screen
        </button>
      )}
      <div>
        <div className="rules-bar">
          <p><u>RULES</u></p>
          <p>Test has to be taken in full view mode.</p>
          <p>If I switch to another tab it should mark it as violation, so please don't switch tabs.</p>
        </div>
      </div>
      <div className="quiz-container">
        {showFullScreenAlert && (
          <div className="fullscreen-alert">
            <p>Please enter full-screen mode to take the test.</p>
          </div>
        )}
        <div>
          <p>Violation count: {violationCount}</p>
        </div>
        {showScore ? (
          <div className="score-section">
            You scored {score} out of {questionsData.length}
            <button className="restart-button"onClick={resetQuiz}>Restart Quiz</button>
          </div>
        ) : (
          <div>
            <div className="question-section">
              <div className="question-count">
                <span>Question {currentQuestionIndex + 1}</span>/{questionsData.length}
              </div>
              <div className="question-text">{questionsData[currentQuestionIndex].question}</div>
            </div>
            <div className="options-section">
              {questionsData[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedOptions[currentQuestionIndex] === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={!isFullScreen} // Disable options if not in full-screen mode
                >
                  {option}
                </button>
              ))}
            </div>
            <div>
              <button className="prev-button" onClick={handlePreviousQuestion} disabled={!isFullScreen || currentQuestionIndex === 0}>
                Previous
              </button>
              <button className="next-button" onClick={handleNextQuestion} disabled={!isFullScreen}>
                {currentQuestionIndex < questionsData.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizApp;
