// Navigation drawer context for slide-out menu state management
import React, {
    createContext,
    ReactNode,
    useContext,
    useRef,
    useState,
} from "react";
import { Animated } from "react-native";

// DRAWER DIMENSIONS
const DRAWER_WIDTH = 300;

// DRAWER CONTEXT VALUE TYPES
interface DrawerContextType {
  isDrawerOpen: boolean;
  slideAnim: Animated.Value;
  toggleDrawer: (open: boolean) => void;
}

// CONTEXT INITIALIZATION
const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// NAVIGATION DRAWER PROVIDER
export function DrawerProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // ANIMATE DRAWER TOGGLE STATE
  const toggleDrawer = (open: boolean): void => {
    setIsDrawerOpen(open);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // CONTEXT PROVIDER WRAPPER
  return React.createElement(
    DrawerContext.Provider,
    {
      value: {
        isDrawerOpen,
        slideAnim,
        toggleDrawer,
      },
    },
    children,
  );
}

// CUSTOM DRAWER CONTEXT CONSUMER
export function useDrawer(): DrawerContextType {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within DrawerProvider");
  }
  return context;
}
