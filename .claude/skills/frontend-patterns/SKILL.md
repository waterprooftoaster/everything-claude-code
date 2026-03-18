---
name: frontend-patterns
description: Frontend development patterns for React Native, Expo, state management, performance optimization, and mobile UI best practices.
origin: ECC
---

# Frontend Development Patterns

Modern frontend patterns for React Native, Expo, and performant mobile user interfaces.

## When to Activate

- Building React Native components (composition, props, rendering)
- Managing state (useState, useReducer, Zustand, Context)
- Implementing data fetching (React Query, SWR, Expo API routes)
- Optimizing performance (memoization, FlatList, lazy screens)
- Working with forms (validation, controlled inputs, Zod schemas)
- Handling navigation with Expo Router
- Building accessible, responsive mobile UI patterns

## Component Patterns

### Composition Over Inheritance

```typescript
// ✅ GOOD: Component composition
import { View, StyleSheet } from 'react-native'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, variant === 'outlined' && styles.cardOutlined]}>
      {children}
    </View>
  )
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardHeader}>{children}</View>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardBody}>{children}</View>
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardOutlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { marginBottom: 8 },
  cardBody: { flex: 1 },
})

// Usage
<Card>
  <CardHeader><Text>Title</Text></CardHeader>
  <CardBody><Text>Content</Text></CardBody>
</Card>
```

### Compound Components

```typescript
import { createContext, useContext, useState } from 'react'
import { Pressable, View, Text, StyleSheet } from 'react-native'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children, defaultTab }: {
  children: React.ReactNode
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View>{children}</View>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <View style={styles.tabList}>{children}</View>
}

export function Tab({ id, children }: { id: string, children: React.ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  return (
    <Pressable
      style={[styles.tab, context.activeTab === id && styles.tabActive]}
      onPress={() => context.setActiveTab(id)}
    >
      <Text style={context.activeTab === id ? styles.tabTextActive : styles.tabText}>
        {children}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tabList: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { paddingVertical: 12, paddingHorizontal: 16 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { color: '#666' },
  tabTextActive: { color: '#007AFF', fontWeight: '600' },
})

// Usage
<Tabs defaultTab="overview">
  <TabList>
    <Tab id="overview">Overview</Tab>
    <Tab id="details">Details</Tab>
  </TabList>
</Tabs>
```

### Render Props Pattern

```typescript
interface DataLoaderProps<T> {
  fetcher: () => Promise<T>
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

export function DataLoader<T>({ fetcher, children }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [fetcher])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataLoader<Market[]> fetcher={() => fetch('/api/markets').then(r => r.json())}>
  {(markets, loading, error) => {
    if (loading) return <ActivityIndicator />
    if (error) return <ErrorView error={error} />
    return <MarketList markets={markets!} />
  }}
</DataLoader>
```

## Custom Hooks Patterns

### State Management Hook

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// Usage
const [isOpen, toggleOpen] = useToggle()
```

### Async Data Fetching Hook

```typescript
interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
}

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setData(result)
      options?.onSuccess?.(result)
    } catch (err) {
      const error = err as Error
      setError(error)
      options?.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [fetcher, options])

  useEffect(() => {
    if (options?.enabled !== false) {
      refetch()
    }
  }, [key, refetch, options?.enabled])

  return { data, error, loading, refetch }
}
```

### Debounce Hook

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
const [searchQuery, setSearchQuery] = useState('')
const debouncedQuery = useDebounce(searchQuery, 500)

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery)
  }
}, [debouncedQuery])
```

## State Management Patterns

### Context + Reducer Pattern

```typescript
import { createContext, useContext, useReducer, Dispatch } from 'react'

interface State {
  markets: Market[]
  selectedMarket: Market | null
  loading: boolean
}

type Action =
  | { type: 'SET_MARKETS'; payload: Market[] }
  | { type: 'SELECT_MARKET'; payload: Market }
  | { type: 'SET_LOADING'; payload: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MARKETS':
      return { ...state, markets: action.payload }
    case 'SELECT_MARKET':
      return { ...state, selectedMarket: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const MarketContext = createContext<{
  state: State
  dispatch: Dispatch<Action>
} | undefined>(undefined)

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    markets: [],
    selectedMarket: null,
    loading: false
  })

  return (
    <MarketContext.Provider value={{ state, dispatch }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarkets() {
  const context = useContext(MarketContext)
  if (!context) throw new Error('useMarkets must be used within MarketProvider')
  return context
}
```

## Performance Optimization

### Memoization

```typescript
// ✅ useMemo for expensive computations
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ useCallback for functions passed to children
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// ✅ React.memo for pure components
export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return (
    <View style={styles.marketCard}>
      <Text style={styles.marketName}>{market.name}</Text>
      <Text style={styles.marketDescription}>{market.description}</Text>
    </View>
  )
})
```

### FlatList for Long Lists

```typescript
import { FlatList, View, Text, StyleSheet } from 'react-native'

interface MarketListProps {
  markets: Market[]
  onMarketPress: (market: Market) => void
}

export function MarketList({ markets, onMarketPress }: MarketListProps) {
  const renderItem = useCallback(({ item }: { item: Market }) => (
    <Pressable onPress={() => onMarketPress(item)} testID={`market-card-${item.id}`}>
      <MarketCard market={item} />
    </Pressable>
  ), [onMarketPress])

  const keyExtractor = useCallback((item: Market) => item.id, [])

  return (
    <FlatList
      data={markets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(_, index) => ({
        length: 100,
        offset: 100 * index,
        index,
      })}
      testID="market-list"
    />
  )
}
```

### Expo Router Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

// Typed navigation with Expo Router
import { useRouter, useLocalSearchParams } from 'expo-router'

export function MarketCard({ market }: { market: Market }) {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.push(`/markets/${market.id}`)}>
      <View style={styles.card}>
        <Text>{market.name}</Text>
      </View>
    </Pressable>
  )
}

// Dynamic route: app/markets/[id].tsx
export default function MarketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  // fetch market by id...
}
```

## StyleSheet Patterns

```typescript
import { StyleSheet, Platform } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  // Platform-specific styles
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Responsive text
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
})
```

## Form Handling Patterns

### Controlled Form with Validation

```typescript
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from 'react-native'

interface FormData {
  name: string
  description: string
  endDate: string
}

interface FormErrors {
  name?: string
  description?: string
  endDate?: string
}

export function CreateMarketForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    endDate: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 200) {
      newErrors.name = 'Name must be under 200 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      await createMarket(formData)
      Alert.alert('Success', 'Market created!')
    } catch (error) {
      Alert.alert('Error', 'Failed to create market')
    }
  }

  return (
    <View style={styles.form}>
      <TextInput
        value={formData.name}
        onChangeText={name => setFormData(prev => ({ ...prev, name }))}
        placeholder="Market name"
        style={[styles.input, errors.name && styles.inputError]}
        testID="market-name-input"
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      {/* Other fields */}

      <Pressable onPress={handleSubmit} style={styles.button} testID="submit-btn">
        <Text style={styles.buttonText}>Create Market</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  form: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  inputError: { borderColor: '#ff3b30' },
  error: { color: '#ff3b30', fontSize: 12, marginBottom: 8 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
```

## Error Boundary Pattern

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorFallback}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Animation Patterns

### React Native Reanimated

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated'

// ✅ Animated list items
export function AnimatedMarketCard({ market }: { market: Market }) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <MarketCard market={market} />
    </Animated.View>
  )
}

// ✅ Animated modal / bottom sheet
export function AnimatedModal({ isOpen, onClose, children }: ModalProps) {
  const translateY = useSharedValue(300)

  useEffect(() => {
    translateY.value = isOpen ? withSpring(0) : withTiming(300)
  }, [isOpen])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!isOpen) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View style={[styles.modalContent, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  )
}
```

## Accessibility Patterns

### React Native Accessibility Props

```typescript
export function MarketCard({ market, onPress }: MarketCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${market.name} market`}
      accessibilityHint="Double tap to view market details"
      testID={`market-card-${market.id}`}
    >
      <View style={styles.card}>
        <Text
          style={styles.name}
          accessibilityRole="header"
        >
          {market.name}
        </Text>
        <Text style={styles.description}>{market.description}</Text>
        <Text
          style={styles.price}
          accessibilityLabel={`Price: ${market.price} dollars`}
        >
          ${market.price}
        </Text>
      </View>
    </Pressable>
  )
}
```

### Focus Management

```typescript
import { useRef } from 'react'
import { TextInput, AccessibilityInfo, Platform } from 'react-native'

export function SearchScreen() {
  const searchInputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Auto-focus search input on screen mount
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus()
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility('Search screen opened')
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <TextInput
      ref={searchInputRef}
      placeholder="Search markets..."
      accessibilityLabel="Search markets"
      testID="search-input"
    />
  )
}
```

**Remember**: Modern React Native patterns enable maintainable, performant mobile interfaces. Choose patterns that fit your project complexity. Always test on both iOS and Android.
