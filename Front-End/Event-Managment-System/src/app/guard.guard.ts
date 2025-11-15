import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const guardGuard: CanActivateFn = (route, state) => {
  const role = localStorage.getItem('guard');

  if (role === 'ADMIN') {
    return true;
  }


  return false;
};
