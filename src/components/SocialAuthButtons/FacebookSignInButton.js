import SocialButton from '../SocialButton/SocialButton';
import { useFacebookSignIn } from '../../hooks/useFacebookSignIn';

export default function FacebookSignInButton({ onResult, disabled }) {
  const { signIn, loading } = useFacebookSignIn(onResult);

  return (
    <SocialButton
      provider="facebook"
      onPress={signIn}
      showChevron={false}
      disabled={disabled || loading}
    />
  );
}
