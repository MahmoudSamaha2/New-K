
export interface FormData {
  nubianNight: string;
  wedding: string;
  travel: string;
  accommodation: string;
  postWedding: string;
  returnPlan?: string;
  name: string;
  countryCode: string;
  phone: string;
  attendees: string;
  notes: string;
}

export type ViewState = 'loader' | 'video' | 'wizard' | 'thankyou';

export interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  question: string;
  options?: string[];
  inputType?: 'radio' | 'text';
  condition?: (data: FormData) => boolean;
}
