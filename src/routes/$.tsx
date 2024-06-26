import { redirect } from 'react-router-dom';
import invariant from 'tiny-invariant';

export function loader() {
  return redirect('/');
}

export function Component() {
  invariant(false);
}
