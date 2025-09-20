import React from 'react';
import { IPhoneSimulator } from '../components/iPhoneSimulator';
import LoginScreen from './login';

export default function DemoScreen() {
  return (
    <IPhoneSimulator>
      <LoginScreen />
    </IPhoneSimulator>
  );
}