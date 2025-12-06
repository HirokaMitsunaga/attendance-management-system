export type SearchConditionResponseDto = {
  id: string;
  formType: string;
  name: string;
  urlParams: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSearchConditionRequestDto = {
  formType: string;
  name: string;
  urlParams: string;
};

export type UpdateSearchConditionRequestDto = {
  id: string;
  name: string;
};
