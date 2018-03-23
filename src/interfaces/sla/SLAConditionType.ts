export type SLAConditionType = {
    name: 'hard' | 'soft';
    value?: number; // when "name" is "soft", then threshold value required
};
