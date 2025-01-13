import { redirect } from 'react-router';
import invariant from 'tiny-invariant';

export function loader() {
  throw redirect('/');
}

export function Component() {
  invariant(false);
}
