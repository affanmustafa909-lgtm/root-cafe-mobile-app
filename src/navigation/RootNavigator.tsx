import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  NavigationContainer,
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OfflineBanner } from '../components/OfflineBanner';
import { fonts, radii } from '../constants/theme';
import { registerForPushNotifications } from '../hooks/usePushNotifications';
import { useMenuSocket } from '../hooks/useMenuSocket';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { CartScreen } from '../screens/CartScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LegalScreen } from '../screens/LegalScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useAppTheme } from '../store/ThemeContext';
import type { Order } from '../types';
import { createNavigationTheme } from './navigationTheme';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Auth: { after?: 'Checkout'; screen?: keyof AuthStackParamList; params?: object } | undefined;
  Main: undefined;
  Menu: { categoryId?: string } | undefined;
  ProductDetails: { productId: string; editCartItemId?: string };
  Checkout: undefined;
  OrderConfirmation: { order: Order };
  OrderTracking: { orderId: string };
  OrderDetails: { orderId: string };
  Settings: undefined;
  ChangePassword: undefined;
  Legal: { type: 'impressum' | 'terms' | 'privacy' };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

type RootNav = NativeStackNavigationProp<RootStackParamList>;

function isExpoDevClientUrl(url: string) {
  return (
    url.includes('expo-development-client') ||
    url.startsWith('exp://') ||
    url.startsWith('exps://') ||
    url.startsWith('exp+')
  );
}

function resetTokenFromUrl(url: string): string | null {
  if (isExpoDevClientUrl(url)) return null;
  try {
    const parsed = Linking.parse(url);
    const path = (parsed.path || '').replace(/^\//, '');
    const token = parsed.queryParams?.token;
    if (
      (path === 'reset-password' || path.endsWith('/reset-password')) &&
      typeof token === 'string' &&
      token.length >= 20
    ) {
      return token;
    }
  } catch {
    /* ignore malformed urls */
  }
  return null;
}

function dismissAuth(
  navigation: {
    dispatch: (
      updater: (state: {
        routes: { name: string; key: string; params?: object }[];
        index: number;
        key: string;
        routeNames: string[];
        type: string;
        stale: boolean;
      }) => ReturnType<typeof CommonActions.reset>,
    ) => void;
  },
  after?: 'Checkout',
) {
  navigation.dispatch((state) => {
    const routes = state.routes.filter(
      (route) => route.name !== 'Auth' && route.name !== 'Splash',
    );
    if (
      after === 'Checkout' &&
      !routes.some((route) => route.name === 'Checkout')
    ) {
      routes.push({ name: 'Checkout', key: 'checkout-after-auth' });
    }
    const checkoutIndex = routes.findIndex((route) => route.name === 'Checkout');
    return CommonActions.reset({
      ...state,
      index:
        after === 'Checkout' && checkoutIndex >= 0
          ? checkoutIndex
          : routes.length - 1,
      routes,
    });
  });
}

function AuthNavigator({
  onAuthenticated,
  onClose,
}: {
  onAuthenticated: () => void;
  onClose: () => void;
}) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onRegister={() => navigation.navigate('Register')}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
            onSuccess={onAuthenticated}
            onClose={onClose}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen
            onLogin={() => navigation.goBack()}
            onSuccess={onAuthenticated}
            onClose={() => navigation.goBack()}
            onOpenLegal={(type) =>
              navigation.getParent()?.navigate('Legal', { type })
            }
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            onBack={() => navigation.navigate('Login')}
            onResetWithToken={(token) =>
              navigation.navigate('ResetPassword', { token })
            }
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="ResetPassword">
        {({ navigation, route }) => (
          <ResetPasswordScreen
            token={route.params.token}
            onBack={() => navigation.navigate('Login')}
            onSuccess={() => navigation.navigate('Login')}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  focused: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.iconWrap}>
      {focused ? (
        <View style={[styles.activeDot, { backgroundColor: colors.coral }]} />
      ) : null}
      <Feather name={name} size={20} color={color} />
    </View>
  );
}

function HomeTabScreen() {
  const navigation = useNavigation<RootNav>();
  return (
    <HomeScreen
      onOpenMenu={(categoryId) => navigation.navigate('Menu', { categoryId })}
      onOpenProduct={(productId) =>
        navigation.navigate('ProductDetails', { productId })
      }
    />
  );
}

function OrdersTabScreen() {
  const navigation = useNavigation<RootNav>();
  return (
    <OrdersScreen
      onOpenOrder={(orderId) => navigation.navigate('OrderDetails', { orderId })}
      onTrackOrder={(orderId) =>
        navigation.navigate('OrderTracking', { orderId })
      }
    />
  );
}

function CartTabScreen() {
  const navigation = useNavigation<RootNav>();
  const { isAuthenticated } = useAuth();
  return (
    <CartScreen
      onContinueShopping={() => navigation.navigate('Menu')}
      onCheckout={() => {
        if (!isAuthenticated) {
          navigation.navigate('Auth', { after: 'Checkout' });
          return;
        }
        navigation.navigate('Checkout');
      }}
      onEditItem={(cartItemId, productId) =>
        navigation.navigate('ProductDetails', {
          productId,
          editCartItemId: cartItemId,
        })
      }
    />
  );
}

function ProfileTabScreen() {
  const navigation = useNavigation<RootNav>();
  return (
    <ProfileScreen
      onOpenSettings={() => navigation.navigate('Settings')}
      onSignIn={() => navigation.navigate('Auth')}
      onOpenLegal={(type) => navigation.navigate('Legal', { type })}
    />
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { colors } = useAppTheme();
  useOrderSocket(isAuthenticated);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.sansSemi,
          marginBottom: 4,
        },
        tabBarStyle: {
          minHeight: 64,
          paddingTop: 8,
          paddingBottom: 6,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: colors.panel,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabScreen}
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersTabScreen}
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clipboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartTabScreen}
        options={{
          title: t('tabs.cart'),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.coral,
            color: colors.white,
            fontFamily: fonts.sansSemi,
            fontSize: 11,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shopping-bag" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTabScreen}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  /** splash → welcome (guests) | app (signed-in) */
  const [phase, setPhase] = useState<'splash' | 'welcome' | 'app'>('splash');
  const { t } = useTranslation();
  const { mode, colors, cafe } = useAppTheme();
  useMenuSocket();
  const navTheme = useMemo(() => createNavigationTheme(mode), [mode]);
  const pendingResetToken = useRef<string | null>(null);
  const leftSplash = useRef(false);
  const authRef = useRef(isAuthenticated);
  authRef.current = isAuthenticated;

  const leaveSplash = useCallback(() => {
    if (leftSplash.current) return;
    leftSplash.current = true;
    setPhase(authRef.current ? 'app' : 'welcome');
  }, []);

  const openResetPassword = useCallback((token: string) => {
    if (!navigationRef.isReady()) {
      pendingResetToken.current = token;
      return;
    }
    navigationRef.navigate('Auth', {
      screen: 'ResetPassword',
      params: { token },
    } as never);
  }, []);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const token = resetTokenFromUrl(url);
      if (token) openResetPassword(token);
    };

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [openResetPassword]);

  const stackScreenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontFamily: fonts.display,
        fontSize: 18,
        color: colors.text,
      },
      headerShadowVisible: false,
      headerBackTitle: '',
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );

  // Hard ceiling: leave splash once, never reset by auth flips or remounts of SplashScreen.
  useEffect(() => {
    const hard = setTimeout(leaveSplash, 2800);
    return () => clearTimeout(hard);
  }, [leaveSplash]);

  // Prefer leaving as soon as auth is resolved (after a short brand beat).
  useEffect(() => {
    if (phase !== 'splash') return;
    if (isLoading) return;
    const soft = setTimeout(leaveSplash, 900);
    return () => clearTimeout(soft);
  }, [phase, isLoading, leaveSplash]);

  // Signed-in users skip welcome if auth resolves after splash already left.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (phase === 'welcome') setPhase('app');
  }, [isAuthenticated, phase]);

  const finishWelcome = useCallback(() => {
    setPhase('app');
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void registerForPushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={() => {
        const token = pendingResetToken.current;
        if (!token) return;
        pendingResetToken.current = null;
        openResetPassword(token);
      }}
    >
      <OfflineBanner />
      <RootStack.Navigator screenOptions={stackScreenOptions}>
        {phase === 'splash' ? (
          <RootStack.Screen name="Splash" options={{ headerShown: false }}>
            {() => <SplashScreen />}
          </RootStack.Screen>
        ) : phase === 'welcome' ? (
          <RootStack.Screen name="Welcome" options={{ headerShown: false }}>
            {() => <WelcomeScreen onGetStarted={finishWelcome} />}
          </RootStack.Screen>
        ) : (
          <>
            <RootStack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <RootStack.Screen name="Auth" options={{ headerShown: false }}>
              {({ navigation, route }) => (
                <AuthNavigator
                  onAuthenticated={() =>
                    dismissAuth(navigation, route.params?.after)
                  }
                  onClose={() => navigation.goBack()}
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="Menu"
              options={{
                title: t('menu.title'),
                headerStyle: { backgroundColor: cafe.bg },
                headerTintColor: cafe.text,
                headerTitleStyle: {
                  fontFamily: fonts.sansSemi,
                  fontSize: 18,
                  color: cafe.text,
                },
                contentStyle: { backgroundColor: cafe.bg },
              }}
            >
              {({ route, navigation }) => (
                <MenuScreen
                  initialCategoryId={route.params?.categoryId}
                  onOpenProduct={(productId) =>
                    navigation.navigate('ProductDetails', { productId })
                  }
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="ProductDetails"
              options={{ headerShown: false }}
            >
              {({ route, navigation }) => (
                <ProductDetailsScreen
                  productId={route.params.productId}
                  editCartItemId={route.params.editCartItemId}
                  onAdded={() => navigation.goBack()}
                  onBack={() => navigation.goBack()}
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="Checkout"
              options={{ title: t('checkout.title') }}
            >
              {({ navigation }) => (
                <CheckoutScreen
                  onNeedAuth={() =>
                    navigation.navigate('Auth', { after: 'Checkout' })
                  }
                  onSuccess={(order) =>
                    navigation.replace('OrderConfirmation', { order })
                  }
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="OrderConfirmation"
              options={{
                title: t('orders.confirmation'),
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            >
              {({ route, navigation }) => (
                <OrderConfirmationScreen
                  order={route.params.order}
                  onTrack={() =>
                    navigation.replace('OrderTracking', {
                      orderId: route.params.order.id,
                    })
                  }
                  onView={() =>
                    navigation.replace('OrderDetails', {
                      orderId: route.params.order.id,
                    })
                  }
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="OrderTracking"
              options={{ title: t('orders.tracking') }}
            >
              {({ route }) => (
                <OrderTrackingScreen orderId={route.params.orderId} />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="OrderDetails"
              options={{ title: t('orders.details') }}
            >
              {({ route }) => (
                <OrderDetailsScreen orderId={route.params.orderId} />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="Settings"
              options={{ title: t('profile.settings') }}
            >
              {({ navigation }) => (
                <SettingsScreen
                  onOpenLegal={(type) => navigation.navigate('Legal', { type })}
                  onChangePassword={() => navigation.navigate('ChangePassword')}
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="ChangePassword"
              options={{ title: t('profile.changePassword') }}
            >
              {({ navigation }) => (
                <ChangePasswordScreen onDone={() => navigation.goBack()} />
              )}
            </RootStack.Screen>
            <RootStack.Screen
              name="Legal"
              options={({ route }) => ({
                title:
                  route.params.type === 'impressum'
                    ? t('legal.impressum')
                    : route.params.type === 'privacy'
                      ? t('auth.privacy')
                      : t('auth.terms'),
              })}
            >
              {({ route }) => <LegalScreen type={route.params.type} />}
            </RootStack.Screen>
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', minWidth: 28 },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 3,
    borderRadius: radii.full,
  },
});
