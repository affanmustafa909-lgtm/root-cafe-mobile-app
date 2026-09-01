import { api } from './client';

export type OnboardingSlide = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string | null;
  title: string;
  body: string;
  titlePlacement: string;
  titleAlign: string;
  bodyAlign: string;
  copyBlockVertical: string;
  showBottomShadow: boolean;
};

export type OnboardingPayload = {
  slides: OnboardingSlide[];
  ctaText: string;
};

export const onboardingApi = {
  async list(): Promise<OnboardingPayload> {
    const { data } = await api.get<OnboardingPayload>('/onboarding');
    return data;
  },
};
