import React, { useState, ReactNode } from 'react';
import { FormData } from '../types';

interface WizardProps {
  initialData: FormData;
  onComplete: