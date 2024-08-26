import React, { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import * as Page from '@components/Page';
import * as Auth from '@components/AuthComponents';
import * as Button from '@components/Button';
import ImagePath from '@constants/ImagePath';
import AlertModel from '@components/AlertModel';
import InputComponent from '@components/InputComponent';
import { TouchableButton } from '@components/Common';
import DatePickerComponent from '@components/DatePickerComponent';
import Theme from '@constants/Theme';
import strings from '@constants/Strings';
import { createUser } from '@services/Apis';
import AuthenticatedUser from '@services/AuthenticatedUser';
import { validateInputs } from '@utils/validations';
import { sanitizedErrorMessage } from '@utils/CommonFunctions';
import Logger from '@services/Logger';

const SignUpScreen = ({ navigation }) => {
  // State for managing form data
  const [state, setState] = useState({
    email: '',
    dob: '',
  });

  // State for managing loading and alert visibility
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /**
   * Handles the registration process when the "Submit" button is pressed.
   * - Validates inputs
   * - Makes an API call to register the user
   * - Displays success alert and navigates back to login screen upon success
   */
  const handleOnPress = async () => {
    // Dismiss the keyboard
    Keyboard.dismiss();

    // Validate the input fields
    const { isValid, errorMsg } = validateInputs({ ...state, type: 'SIGNUP' });

    if (isValid) {
      // Show loading indicator
      setLoading(true);

      try {
        const { email, dob } = state;

        // Call the sign-up API
        const response = await createUser({
          email,
          billing_birth_date: dob,
        });

        // Handle the API response
        const { status, message } = response;
        if (status === true) {
          // Show success alert
          setShowAlert(true);

          // Persist user data
          AuthenticatedUser.persist(response);
        } else {
          // Show error message
          Alert.alert(strings.appTitle, sanitizedErrorMessage(message));
        }
      } catch (e) {
        // Api error log
        Logger.error(sanitizedErrorMessage(e.message));
      } finally {
        // Hide loading indicator
        setLoading(false);
      }
    } else {
      // Show validation error
      Alert.alert(strings.appTitle, errorMsg);
    }
  };

  return (
    <Page.FullScreenKeyboardAvoidingScrollView>
      <Auth.Container>
        {/* Top section with logo and introductory text */}
        <Auth.SectionTop>
          <Auth.LogoImage source={ImagePath.introLogo} />
          <Auth.Heading>Register</Auth.Heading>
          <Auth.BodyText light>Fill the details to create your account</Auth.BodyText>
        </Auth.SectionTop>

        {/* Bottom section with input fields and submit button */}
        <Auth.SectionBottom>
          <Page.Block>
            <InputComponent
              required
              label="Email address"
              value={state.email}
              autoCapitalize="none"
              placeholder="Enter email"
              keyboardType="email-address"
              onChangeText={(text) =>
                setState({
                  ...state,
                  email: text,
                })
              }
            />
            <DatePickerComponent
              label="Birthday"
              value={state.dob}
              onConfirm={(date) =>
                setState({
                  ...state,
                  dob: date,
                })
              }
            />
          </Page.Block>

          {/* Privacy policy notice and submit button */}
          <Page.Block paddingTop={Theme.space.xxsmall}>
            <Auth.BodyText
              medium
              light
              paddingBottom={Theme.space.small}
              paddingHorizontal={Theme.space.small}
            >
              Your personal data will be used to support your experience throughout this website, to
              manage access to your account, and for other purposes described in our{' '}
              <Auth.BodyText
                medium
                onPress={() =>
                  navigation.navigate('Webview', {
                    uri: strings.settings[3].url,
                    title: strings.settings[3].text,
                  })
                }
              >
                privacy policy.
              </Auth.BodyText>
            </Auth.BodyText>
            <Button.Large disabled={loading} onPress={handleOnPress}>
              <Button.IndicatorButton isLoading={loading} text="Submit" />
            </Button.Large>
          </Page.Block>

          {/* Footer with link to login screen */}
          <Auth.Footer>
            <Auth.BodyText light>Already have an account?</Auth.BodyText>
            <TouchableButton onPress={() => navigation.goBack()}>
              <Auth.BodyText bold>Login</Auth.BodyText>
            </TouchableButton>
          </Auth.Footer>
        </Auth.SectionBottom>
      </Auth.Container>

      {/* Alert modal shown after successful registration */}
      <AlertModel
        type="success"
        showAlert={showAlert}
        header="EMAIL LINK"
        message="Please check your registered Email for setting up your account password."
        buttonTitle="Back to Login"
        closeOnPress={() => setShowAlert(false)}
        doneOnPress={() => {
          setShowAlert(false);
          setTimeout(() => {
            navigation.goBack();
          }, 200);
        }}
      />
    </Page.FullScreenKeyboardAvoidingScrollView>
  );
};

export default SignUpScreen;
