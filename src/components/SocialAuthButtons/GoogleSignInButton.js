import SocialButton from '../SocialButton/SocialButton';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';

export default function GoogleSignInButton({ onResult, disabled }) {
  const { signIn, loading } = useGoogleSignIn(onResult);

  return (
    <SocialButton
      provider="google"
      onPress={signIn}
      showChevron={false}
      disabled={disabled || loading}
    />
  );
}
