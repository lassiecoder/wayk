/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SkyOnboarding from './src/screens/SkyOnboarding';
import PlanIntroScreen from './src/screens/PlanIntroScreen';
import QuestionnaireScreen, {
  ALARM_QUESTIONS,
  ALARM_QUESTIONS_OFFSET,
  ALARM_SOUND_SCREEN_PROGRESS,
  BIOLOGY_SCREEN_PROGRESS,
  COMMITMENT_SCREEN_PROGRESS,
  DAYS_SCREEN_PROGRESS,
  ENERGY_LEVELS_PROGRESS,
  EXERCISE_SETUP_SCREEN_PROGRESS,
  MISSION_ALARM_SCREEN_PROGRESS,
  MISSION_SCREEN_PROGRESS,
  MISSION_SELECT_SCREEN_PROGRESS,
  NIGHT_QUESTIONS,
  NIGHT_QUESTIONS_OFFSET,
  NOTIFICATION_SCREEN_PROGRESS,
  REFERRAL_CODE_SCREEN_PROGRESS,
  REFERRAL_SOURCE_SCREEN_PROGRESS,
  SET_ALARM_SCREEN_PROGRESS,
  SPEED_GAUGE_SCREEN_PROGRESS,
  WAKE_GOAL_SCREEN_PROGRESS,
  WAKE_TIME_SCREEN_PROGRESS,
} from './src/screens/QuestionnaireScreen';
import EnergyLevelsScreen from './src/screens/EnergyLevelsScreen';
import MissionScreen from './src/screens/MissionScreen';
import BiologyScreen from './src/screens/BiologyScreen';
import WakeTimeScreen from './src/screens/WakeTimeScreen';
import WakeGoalScreen from './src/screens/WakeGoalScreen';
import WakeTargetScreen from './src/screens/WakeTargetScreen';
import QuoteScreen from './src/screens/QuoteScreen';
import MissionSelectScreen from './src/screens/MissionSelectScreen';
import ExerciseSetupScreen from './src/screens/ExerciseSetupScreen';
import ExerciseInsightScreen from './src/screens/ExerciseInsightScreen';
import SetAlarmScreen from './src/screens/SetAlarmScreen';
import DaysScreen from './src/screens/DaysScreen';
import AlarmSoundScreen from './src/screens/AlarmSoundScreen';
import MissionAlarmScreen from './src/screens/MissionAlarmScreen';
import ReferralSourceScreen from './src/screens/ReferralSourceScreen';
import ReferralCodeScreen from './src/screens/ReferralCodeScreen';
import SpeedGaugeScreen from './src/screens/SpeedGaugeScreen';
import NotificationPermissionScreen from './src/screens/NotificationPermissionScreen';
import CommitmentScreen from './src/screens/CommitmentScreen';
import SetupLoadingScreen from './src/screens/SetupLoadingScreen';
import ReferralUnlockScreen from './src/screens/ReferralUnlockScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import MorningPlanScreen from './src/screens/MorningPlanScreen';

// Only these missions need a duration/reps setup step; the rest (a photo or
// a math problem) don't have a configurable quantity.
const EXERCISE_LABELS: Record<string, string> = {
  pushUps: 'push-ups',
  squats: 'squats',
};

type Screen =
  | 'sky'
  | 'planIntro'
  | 'questionnaire'
  | 'energyLevels'
  | 'alarmQuestions'
  | 'mission'
  | 'nightQuestions'
  | 'biology'
  | 'wakeTime'
  | 'wakeGoal'
  | 'wakeTarget'
  | 'quote'
  | 'missionSelect'
  | 'exerciseSetup'
  | 'exerciseInsight'
  | 'setAlarm'
  | 'days'
  | 'alarmSound'
  | 'missionAlarm'
  | 'referralSource'
  | 'referralCode'
  | 'speedGauge'
  | 'notificationPermission'
  | 'commitment'
  | 'setupLoading'
  | 'morningPlanPreview'
  | 'referralUnlock'
  | 'createAccount'
  | 'morningPlan';

function App() {
  const [screen, setScreen] = useState<Screen>('sky');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [alarmQuizIndex, setAlarmQuizIndex] = useState(0);
  const [nightQuizIndex, setNightQuizIndex] = useState(0);
  const [wakeGoalTime, setWakeGoalTime] = useState('7:30 AM');
  const [wakeMission, setWakeMission] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={screen === 'sky' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      {screen === 'sky' && (
        <SkyOnboarding onComplete={() => setScreen('planIntro')} />
      )}
      {screen === 'planIntro' && (
        <PlanIntroScreen onContinue={() => setScreen('questionnaire')} />
      )}
      {screen === 'questionnaire' && (
        <QuestionnaireScreen
          index={quizIndex}
          answers={quizAnswers}
          onIndexChange={setQuizIndex}
          onAnswersChange={setQuizAnswers}
          onBack={() => setScreen('planIntro')}
          onComplete={() => setScreen('energyLevels')}
        />
      )}
      {screen === 'energyLevels' && (
        <EnergyLevelsScreen
          progress={ENERGY_LEVELS_PROGRESS}
          onBack={() => setScreen('questionnaire')}
          onContinue={() => setScreen('alarmQuestions')}
        />
      )}
      {screen === 'alarmQuestions' && (
        <QuestionnaireScreen
          questions={ALARM_QUESTIONS}
          progressOffset={ALARM_QUESTIONS_OFFSET}
          index={alarmQuizIndex}
          answers={quizAnswers}
          onIndexChange={setAlarmQuizIndex}
          onAnswersChange={setQuizAnswers}
          onBack={() => setScreen('energyLevels')}
          onComplete={() => setScreen('mission')}
          showFlag={false}
        />
      )}
      {screen === 'mission' && (
        <MissionScreen
          progress={MISSION_SCREEN_PROGRESS}
          onBack={() => setScreen('alarmQuestions')}
          onContinue={() => setScreen('nightQuestions')}
        />
      )}
      {screen === 'nightQuestions' && (
        <QuestionnaireScreen
          questions={NIGHT_QUESTIONS}
          progressOffset={NIGHT_QUESTIONS_OFFSET}
          index={nightQuizIndex}
          answers={quizAnswers}
          onIndexChange={setNightQuizIndex}
          onAnswersChange={setQuizAnswers}
          onBack={() => setScreen('mission')}
          onComplete={() => setScreen('biology')}
          showFlag={false}
        />
      )}
      {screen === 'biology' && (
        <BiologyScreen
          progress={BIOLOGY_SCREEN_PROGRESS}
          onBack={() => setScreen('nightQuestions')}
          onContinue={() => setScreen('wakeTime')}
        />
      )}
      {screen === 'wakeTime' && (
        <WakeTimeScreen
          progress={WAKE_TIME_SCREEN_PROGRESS}
          onBack={() => setScreen('biology')}
          onContinue={() => setScreen('wakeGoal')}
        />
      )}
      {screen === 'wakeGoal' && (
        <WakeGoalScreen
          progress={WAKE_GOAL_SCREEN_PROGRESS}
          onBack={() => setScreen('wakeTime')}
          onContinue={time => {
            setWakeGoalTime(time);
            setScreen('wakeTarget');
          }}
        />
      )}
      {screen === 'wakeTarget' && (
        <WakeTargetScreen
          time={wakeGoalTime}
          progress={WAKE_GOAL_SCREEN_PROGRESS}
          onBack={() => setScreen('wakeGoal')}
          onContinue={() => setScreen('quote')}
        />
      )}
      {screen === 'quote' && (
        <QuoteScreen
          progress={WAKE_GOAL_SCREEN_PROGRESS}
          onBack={() => setScreen('wakeTarget')}
          onContinue={() => setScreen('missionSelect')}
        />
      )}
      {screen === 'missionSelect' && (
        <MissionSelectScreen
          progress={MISSION_SELECT_SCREEN_PROGRESS}
          onBack={() => setScreen('quote')}
          onContinue={missionId => {
            setWakeMission(missionId);
            setScreen(
              EXERCISE_LABELS[missionId] ? 'exerciseSetup' : 'setAlarm',
            );
          }}
        />
      )}
      {screen === 'exerciseSetup' && wakeMission && (
        <ExerciseSetupScreen
          exerciseLabel={EXERCISE_LABELS[wakeMission]}
          progress={EXERCISE_SETUP_SCREEN_PROGRESS}
          onBack={() => setScreen('missionSelect')}
          onContinue={() =>
            setScreen(
              wakeMission === 'pushUps' ? 'exerciseInsight' : 'setAlarm',
            )
          }
        />
      )}
      {screen === 'exerciseInsight' && wakeMission === 'pushUps' && (
        <ExerciseInsightScreen
          title="Why doing push ups wakes you up"
          image={require('./assets/images/pushups.webp')}
          heading="Gets your blood pumping right away"
          body="Short bursts of effort spike cortisol and adrenaline, raising heart rate and body temperature so you feel awake fast."
          progress={EXERCISE_SETUP_SCREEN_PROGRESS}
          onBack={() => setScreen('exerciseSetup')}
          onContinue={() => setScreen('setAlarm')}
        />
      )}
      {screen === 'setAlarm' && (
        <SetAlarmScreen
          progress={SET_ALARM_SCREEN_PROGRESS}
          onBack={() =>
            setScreen(
              wakeMission === 'pushUps'
                ? 'exerciseInsight'
                : wakeMission && EXERCISE_LABELS[wakeMission]
                ? 'exerciseSetup'
                : 'missionSelect',
            )
          }
          onContinue={() => setScreen('days')}
        />
      )}
      {screen === 'days' && (
        <DaysScreen
          progress={DAYS_SCREEN_PROGRESS}
          onBack={() => setScreen('setAlarm')}
          onContinue={() => setScreen('alarmSound')}
        />
      )}
      {screen === 'alarmSound' && (
        <AlarmSoundScreen
          progress={ALARM_SOUND_SCREEN_PROGRESS}
          onBack={() => setScreen('days')}
          onContinue={() => setScreen('missionAlarm')}
        />
      )}
      {screen === 'missionAlarm' && (
        <MissionAlarmScreen
          progress={MISSION_ALARM_SCREEN_PROGRESS}
          onBack={() => setScreen('alarmSound')}
          onContinue={() => setScreen('referralSource')}
        />
      )}
      {screen === 'referralSource' && (
        <ReferralSourceScreen
          progress={REFERRAL_SOURCE_SCREEN_PROGRESS}
          onBack={() => setScreen('missionAlarm')}
          onContinue={() => setScreen('referralCode')}
        />
      )}
      {screen === 'referralCode' && (
        <ReferralCodeScreen
          progress={REFERRAL_CODE_SCREEN_PROGRESS}
          onBack={() => setScreen('referralSource')}
          onContinue={() => setScreen('speedGauge')}
        />
      )}
      {screen === 'speedGauge' && (
        <SpeedGaugeScreen
          progress={SPEED_GAUGE_SCREEN_PROGRESS}
          onBack={() => setScreen('referralCode')}
          onContinue={() => setScreen('notificationPermission')}
        />
      )}
      {screen === 'notificationPermission' && (
        <NotificationPermissionScreen
          progress={NOTIFICATION_SCREEN_PROGRESS}
          onBack={() => setScreen('speedGauge')}
          onContinue={() => setScreen('commitment')}
        />
      )}
      {screen === 'commitment' && (
        <CommitmentScreen
          wakeTime={wakeGoalTime}
          progress={COMMITMENT_SCREEN_PROGRESS}
          onBack={() => setScreen('notificationPermission')}
          onContinue={() => setScreen('setupLoading')}
        />
      )}
      {screen === 'setupLoading' && (
        <SetupLoadingScreen
          wakeMission={wakeMission}
          wakeTime={wakeGoalTime}
          onComplete={() => setScreen('morningPlanPreview')}
        />
      )}
      {screen === 'morningPlanPreview' && (
        <MorningPlanScreen
          wakeMission={wakeMission}
          wakeTime={wakeGoalTime}
          onContinue={() => setScreen('referralUnlock')}
        />
      )}
      {screen === 'referralUnlock' && (
        <ReferralUnlockScreen
          onBack={() => setScreen('morningPlanPreview')}
          onContinue={() => setScreen('createAccount')}
        />
      )}
      {screen === 'createAccount' && (
        <CreateAccountScreen onContinue={() => setScreen('morningPlan')} />
      )}
      {screen === 'morningPlan' && (
        <MorningPlanScreen
          wakeMission={wakeMission}
          wakeTime={wakeGoalTime}
          onContinue={() => setScreen('planIntro')}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
