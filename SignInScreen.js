import React, { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import * as Page from '@components/Page';
import * as Auth from '@components/AuthComponents';
import * as Button from '@components/Button';
import InputComponent from '@components/InputComponent';
import { TouchableButton } from '@components/Common';
import ImagePath from '@constants/ImagePath';
import Theme from '@constants/Theme';
import strings from '@constants/Strings';
import { validateInputs } from '@utils/validations';
import NavigationService from '@utils/NavigationService';
import { sanitizedErrorMessage } from '@utils/CommonFunctions';
import { signInUser } from '@services/Apis';
import AuthenticatedUser from '@services/AuthenticatedUser';

const SignInScreen = ({ navigation }) => {
  // State for loading indicator and form inputs
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    email: '',
    password: '',
  });

  const handleOnPress = async () => {
    // Dismiss the keyboard
    Keyboard.dismiss();

    // Validate the input fields
    const { isValid, errorMsg } = validateInputs({ ...state, type: 'SIGNIN' });

    if (isValid) {
      setLoading(true); // Show loading indicator

      try {
        const { email, password } = state;

        // Call the sign-in API
        const response = await signInUser({
          device_token: global.fcmToken,
          email,
          password,
        });

        // Handle the API response
        const { status, message } = response;

        if (status === true) {
          // Persist user data and navigate to the main app screen
          AuthenticatedUser.persist(response?.data);
          AuthenticatedUser.storeUserProfile();
          AuthenticatedUser.storeRewardsPools();

          NavigationService.setRoot('App');
        } else {
          // Show error message
          Alert.alert(strings.appTitle, sanitizedErrorMessage(message));
        }
      } catch (e) {
        Alert.alert(strings.appTitle, sanitizedErrorMessage(e.message));
      } finally {
        setLoading(false); // Hide loading indicator regardless of success or failure
      }
    } else {
      Alert.alert(strings.appTitle, errorMsg); // Show validation error
    }
  };

  return (
    <Page.FullScreenKeyboardAvoidingScrollView>
      <Auth.Container>
        {/* Top Section with Logo and Heading */}
        <Auth.SectionTop>
          <Auth.LogoImage source={ImagePath.introLogo} />
          <Auth.Heading> Login </Auth.Heading>
          <Auth.BodyText light> Enter your account details </Auth.BodyText>
        </Auth.SectionTop>

        {/* Bottom Section with Input Fields and Buttons */}
        <Auth.SectionBottom>
          <Page.Block>
            {/* Email Input */}
            <InputComponent
              label="Username or email address"
              placeholder="Enter username or email"
              value={state.email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(text) =>
                setState({
                  ...state,
                  email: text,
                })
              }
            />
            {/* Password Input */}
            <InputComponent
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              onChangeText={(text) =>
                setState({
                  ...state,
                  password: text,
                })
              }
            />
          </Page.Block>

          <Page.Block>
            {/* Forgot Password Link */}
            <TouchableButton onPress={() => navigation.navigate('ForgotPassword')}>
              <Auth.BodyText bold textAlign="center" paddingBottom={Theme.space.small}>
                Forgot Password?
              </Auth.BodyText>
            </TouchableButton>

            {/* Login Button */}
            <Button.Large disabled={loading} onPress={handleOnPress}>
              <Button.IndicatorButton isLoading={loading} text="Login" />
            </Button.Large>
          </Page.Block>

          {/* Footer Section with Registration Link */}
          <Auth.Footer>
            <Auth.BodyText light> Don't have an account? </Auth.BodyText>
            <TouchableButton onPress={() => navigation.navigate('Signup')}>
              <Auth.BodyText bold>Register Now</Auth.BodyText>
            </TouchableButton>
          </Auth.Footer>
        </Auth.SectionBottom>
      </Auth.Container>
    </Page.FullScreenKeyboardAvoidingScrollView>
  );
};

export default SignInScreen;
