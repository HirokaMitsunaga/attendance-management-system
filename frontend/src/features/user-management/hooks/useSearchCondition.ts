import { useCallback } from 'react';
import { useSearchCondition as useSearchConditionBase } from '@/hooks/useSearchCondition';

const FORM_TYPE = 'user';
const CURRENT_PATH = '/admin/user-management';

const buildUrlParams = (searchParams: URLSearchParams): string => {
  const params = new URLSearchParams();
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  const role = searchParams.get('role');
  const gender = searchParams.get('gender');
  const departmentId = searchParams.get('departmentId');
  const page = searchParams.get('page');

  if (id) params.set('id', id);
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (gender) params.set('gender', gender);
  if (departmentId) params.set('departmentId', departmentId);
  if (page && page !== '1') params.set('page', page);

  return params.toString();
};

export const useSearchCondition = () => {
  const buildUrlParamsFn = useCallback(
    (params: URLSearchParams) => buildUrlParams(params),
    [],
  );

  return useSearchConditionBase({
    formType: FORM_TYPE,
    currentPath: CURRENT_PATH,
    buildUrlParams: buildUrlParamsFn,
  });
};
