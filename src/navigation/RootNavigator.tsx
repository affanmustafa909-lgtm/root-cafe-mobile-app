import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, WELCOME_VERSION } from '../constants/config';
import { OfflineBanner } from '../components/OfflineBanner';
import { fonts, radii } from '../constants/theme';
import { registerForPushNotifications } from '../hooks/usePushNotifications';
import { useMenuSocket } from '../hooks/useMenuSocket';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
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
  Auth: { after?: 'Checkout' } | undefined;
  Main: undefined;
  Menu: { categoryId?: string } | undefined;
  ProductDetails: { productId: string; editCartItemId?: string };
  Checkout: undefined;
  OrderConfirmation: { order: Order };
  OrderTracking: { orderId: string };
  OrderDetails: { orderId: string };
  Settings: undefined;
  Legal: { type: 'terms' | 'privacy' };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
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

type RootNav = NativeStackNavigationProp<RootStackParamList>;

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
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { t } = useTranslation();
  const { mode, colors, cafe } = useAppTheme();
  useMenuSocket();
  const navTheme = React.useMemo(() => createNavigationTheme(mode), [mode]);

  const stackScreenOptions = React.useMemo(
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

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.welcomeSeen).then((value) => {
      const seen = value === WELCOME_VERSION;
      setOnboardingDone(seen);
      if (!seen) setShowSplash(true);
    });
  }, []);

  const onSplashReady = useCallback(() => {
    setShowSplash(false);
    setShowWelcome(true);
  }, []);

  const finishWelcome = useCallback(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.welcomeSeen, WELCOME_VERSION).finally(() => {
      setShowWelcome(false);
      setOnboardingDone(true);
      setShowSplash(false);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void registerForPushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer theme={navTheme}>
      <OfflineBanner />
      <RootStack.Navigator screenOptions={stackScreenOptions}>
        {onboardingDone === null || isLoading ? (
          <RootStack.Screen name="Splash" options={{ headerShown: false }}>
            {() => <SplashScreen onReady={() => {}} quick />}
          </RootStack.Screen>
        ) : showSplash ? (
          <RootStack.Screen name="Splash" options={{ headerShown: false }}>
            {() => <SplashScreen onReady={onSplashReady} />}
          </RootStack.Screen>
        ) : showWelcome ? (
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
                />
              )}
            </RootStack.Screen>
            <RootStack.Screen name="Legal" options={{ title: t('auth.terms') }}>
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
