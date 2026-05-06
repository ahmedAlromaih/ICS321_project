import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Boxes,
  CheckCircle2,
  CreditCard,
  Database,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Minus,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  User,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

type Notice = {
  tone: 'success' | 'error';
  message: string;
};

type View =
  | 'signin'
  | 'signup'
  | 'shop'
  | 'payment'
  | 'admin'
  | 'settings'
  | 'account-update'
  | 'seller-products';
type SettingsTab = 'account' | 'orders' | 'products';

type Summary = {
  total_products: number;
  active_products: number;
  total_orders: number;
  revenue: number;
  low_stock: number;
  out_of_stock: number;
  total_customers: number;
};

type Category = {
  category_id: number;
  parent_category_id: number | null;
  name: string;
  description: string;
  parent_name: string | null;
  product_count: number;
};

type Product = {
  product_id: number;
  category_id: number;
  seller_customer_id: number | null;
  name: string;
  description: string;
  price: string | number;
  image_url: string | null;
  product_condition: 'new' | 'used';
  category_name: string;
  seller_name: string | null;
  quantity_in_stock: number;
  reorder_level: number;
  stock_status: 'in_stock' | 'low' | 'out';
  average_rating: string | number;
  review_count: number;
};

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'student' | 'staff' | 'teacher';
  street?: string;
  city?: string;
  country?: string;
  postal_code?: string | null;
  created_at?: string;
  is_active?: boolean;
  order_count?: number;
  total_spent?: string | number;
  last_order_at?: string | null;
};

type Session =
  | { kind: 'customer'; customer: Customer }
  | { kind: 'admin'; admin: { name: string; email: string } };

type CartItem = {
  product_id: number;
  quantity: number;
  name: string;
  price: string | number;
  category_name: string;
  quantity_in_stock: number;
  stock_status: 'in_stock' | 'low' | 'out';
  line_total: string | number;
};

type Cart = {
  cart_id: number;
  customer_id: number;
  items: CartItem[];
  total: number;
};

type Order = {
  order_id: number;
  customer_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string | null;
  order_date: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: string | number;
  seller_total_amount?: string | number;
  item_count: number;
  items: string | null;
  seller_confirmed_delivery_at?: string | null;
  buyer_confirmed_delivery_at?: string | null;
  payout_released_at?: string | null;
};

type Review = {
  review_id: number;
  product_id: number;
  rating: number;
  comment: string;
  product_name: string;
  customer_name: string;
};

type SellerWallet = {
  customer_id: number;
  available_balance: string | number;
  pending_balance: string | number;
  total_withdrawn: string | number;
  updated_at: string;
  withdrawals: WithdrawalRequest[];
};

type WithdrawalRequest = {
  withdrawal_id: number;
  amount: string | number;
  bank_account_name: string;
  iban: string;
  request_status: string;
  requested_at: string;
  estimated_arrival_at?: string | null;
  processed_at?: string | null;
};

const currency = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
});

const productImages: Record<string, string> = {
  calculator:
    'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80',
  usb: 'https://images.unsplash.com/photo-1616353071855-2c045c4458f6?auto=format&fit=crop&w=900&q=80',
  textbook:
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
  notebook:
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
  hoodie:
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
  pen: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80',
};

const emptySignIn = {
  email: '',
  password: '',
};

const emptySignUp = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'student',
  street: '',
  city: 'Dhahran',
  country: 'Saudi Arabia',
  postal_code: '31261',
};

const emptyPayment = {
  card_name: '',
  card_number: '',
  expiry: '',
  cvv: '',
  method: 'Credit Card',
};

const emptySellProduct = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  image_url: '',
  product_condition: 'used',
  quantity: '1',
};

const emptyAccountForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'student',
  street: '',
  city: '',
  country: '',
  postal_code: '',
};

type AccountForm = typeof emptyAccountForm;

type ProductEditForm = {
  name: string;
  category_id: string;
  description: string;
  price: string;
  image_url: string;
  product_condition: string;
  quantity: string;
};

function customerToAccountForm(customer: Customer | null): AccountForm {
  return {
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    password: '',
    phone: customer?.phone || '',
    role: customer?.role || 'student',
    street: customer?.street || '',
    city: customer?.city || 'Dhahran',
    country: customer?.country || 'Saudi Arabia',
    postal_code: customer?.postal_code || '31261',
  };
}

function productToEditForm(product: Product): ProductEditForm {
  return {
    name: product.name,
    category_id: String(product.category_id),
    description: product.description || '',
    price: String(product.price),
    image_url: product.image_url || '',
    product_condition: product.product_condition || 'used',
    quantity: String(product.quantity_in_stock ?? 0),
  };
}

function formatMoney(value: number | string) {
  return currency.format(Number(value));
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : 'The request could not be completed.';

    throw new Error(message);
  }

  return payload as T;
}

function productImage(product: Product) {
  if (product.image_url?.startsWith('http')) {
    return product.image_url;
  }

  const key = Object.keys(productImages).find((name) =>
    product.name.toLowerCase().includes(name),
  );

  return key ? productImages[key] : productImages.notebook;
}

function stockTone(status: Product['stock_status'] | CartItem['stock_status']) {
  if (status === 'out') {
    return 'border-[#f2b8b5] bg-[#fff1f2] text-[#b42335]';
  }

  if (status === 'low') {
    return 'border-[#f6d58b] bg-[#fff8e5] text-[#946200]';
  }

  return 'border-[#bfe3d7] bg-[#eefaf5] text-[#1f765f]';
}

function statusTone(status: string) {
  if (status === 'cancelled' || status === 'refunded') {
    return 'bg-[#fff1f2] text-[#b42335]';
  }

  if (status === 'paid' || status === 'delivered') {
    return 'bg-[#eefaf5] text-[#1f765f]';
  }

  return 'bg-[#fff8e5] text-[#7a5a00]';
}

function stockLabel(status: Product['stock_status'] | CartItem['stock_status']) {
  return status.replace('_', ' ');
}

export default function App() {
  const [view, setView] = useState<View>('signin');
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bank_account_name: '',
    iban: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');
  const [search, setSearch] = useState('');
  const [signInForm, setSignInForm] = useState(emptySignIn);
  const [signUpForm, setSignUpForm] = useState(emptySignUp);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [sellProductForm, setSellProductForm] = useState(emptySellProduct);
  const [accountForm, setAccountForm] = useState<AccountForm>(emptyAccountForm);
  const [productEditForms, setProductEditForms] = useState<Record<number, ProductEditForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const customer = session?.kind === 'customer' ? session.customer : null;

  const visibleProducts = useMemo(() => {
    const text = search.trim().toLowerCase();
    const customerVisible = products.filter((product) => product.stock_status !== 'out');

    if (!text) {
      return customerVisible;
    }

    return customerVisible.filter((product) =>
      [product.name, product.description, product.category_name]
        .join(' ')
        .toLowerCase()
        .includes(text),
    );
  }, [products, search]);

  const myProducts = useMemo(() => {
    if (!customer) {
      return [];
    }

    return products.filter(
      (product) => product.seller_customer_id === customer.customer_id,
    );
  }, [customer, products]);

  useEffect(() => {
    if (!myProducts.length) {
      return;
    }

    setProductEditForms((current) => {
      const next = { ...current };

      for (const product of myProducts) {
        if (!next[product.product_id]) {
          next[product.product_id] = productToEditForm(product);
        }
      }

      return next;
    });
  }, [myProducts]);

  async function loadCatalog(categoryId = selectedCategory) {
    const params = new URLSearchParams();
    if (categoryId !== 'all') {
      params.set('category_id', String(categoryId));
    }

    const query = params.toString();
    const rows = await readJson<Product[]>(
      await fetch(`/api/products${query ? `?${query}` : ''}`),
    );
    setProducts(rows);
  }

  async function loadCart(customerId: number) {
    const rows = await readJson<Cart>(
      await fetch(`/api/cart?customer_id=${customerId}`),
    );
    setCart(rows);
  }

  async function loadOrders(customerId?: number) {
    const query = customerId ? `?customer_id=${customerId}` : '';
    const rows = await readJson<Order[]>(await fetch(`/api/orders${query}`));
    setOrders(rows);
  }

  async function loadSellerOrders(customerId: number) {
    const rows = await readJson<Order[]>(
      await fetch(`/api/orders?seller_customer_id=${customerId}`),
    );
    setSellerOrders(rows);
  }

  async function loadWallet(customerId: number) {
    const rows = await readJson<SellerWallet>(
      await fetch(`/api/wallet?customer_id=${customerId}`),
    );
    setWallet(rows);
  }

  async function openProductDetails(product: Product) {
    setSelectedProduct(product);
    const rows = await readJson<Review[]>(
      await fetch(`/api/reviews?product_id=${product.product_id}`),
    );
    setProductReviews(rows);
  }

  async function loadBaseData(nextSession = session) {
    if (!nextSession) {
      return;
    }

    setIsLoading(true);
    setNotice(null);

    try {
      const [
        summaryResponse,
        categoryResponse,
        productResponse,
        customerResponse,
        reviewResponse,
      ] =
        await Promise.all([
          fetch('/api/summary'),
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch('/api/customers'),
          fetch('/api/reviews'),
        ]);
      const [summaryRows, categoryRows, productRows, customerRows, reviewRows] =
        await Promise.all([
          readJson<Summary>(summaryResponse),
          readJson<Category[]>(categoryResponse),
          readJson<Product[]>(productResponse),
          readJson<Customer[]>(customerResponse),
          readJson<Review[]>(reviewResponse),
        ]);

      setSummary(summaryRows);
      setCategories(categoryRows);
      setProducts(productRows);
      setCustomers(customerRows);
      setReviews(reviewRows);

      if (nextSession.kind === 'customer') {
        await Promise.all([
          loadCart(nextSession.customer.customer_id),
          loadOrders(nextSession.customer.customer_id),
          loadSellerOrders(nextSession.customer.customer_id),
          loadWallet(nextSession.customer.customer_id),
        ]);
      } else {
        setCart(null);
        setSellerOrders([]);
        setWallet(null);
        await loadOrders();
      }
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load KFUPM store data.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!session) {
      return;
    }

    loadCatalog(selectedCategory).catch((error) =>
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to filter products.',
      }),
    );
  }, [selectedCategory]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setNotice(null);

    try {
      const nextSession = await readJson<Session>(
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signInForm),
        }),
      );

      setSession(nextSession);
      setView(nextSession.kind === 'admin' ? 'admin' : 'shop');
      await loadBaseData(nextSession);
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to sign in.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setNotice(null);

    try {
      const nextSession = await readJson<Session>(
        await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signUpForm),
        }),
      );

      setSession(nextSession);
      setView('shop');
      setSignUpForm(emptySignUp);
      await loadBaseData(nextSession);
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to create account.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  function signOut() {
    setSession(null);
    setCart(null);
    setCustomers([]);
    setOrders([]);
    setSellerOrders([]);
    setSelectedProduct(null);
    setProductReviews([]);
    setWallet(null);
    setWithdrawalForm({ amount: '', bank_account_name: '', iban: '' });
    setSellProductForm(emptySellProduct);
    setAccountForm(emptyAccountForm);
    setProductEditForms({});
    setSettingsTab('account');
    setNotice(null);
    setView('signin');
  }

  async function addToCart(productId: number) {
    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            product_id: productId,
            quantity: 1,
          }),
        }),
      );
      await loadCart(customer.customer_id);
      setNotice({ tone: 'success', message: 'Product added to the cart.' });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to add this product.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function changeQuantity(item: CartItem, quantity: number) {
    if (!customer) {
      return;
    }

    if (quantity < 1) {
      await removeFromCart(item.product_id);
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            product_id: item.product_id,
            quantity,
          }),
        }),
      );
      await loadCart(customer.customer_id);
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to update the cart.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function removeFromCart(productId: number) {
    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch(
          `/api/cart?customer_id=${customer.customer_id}&product_id=${productId}`,
          { method: 'DELETE' },
        ),
      );
      await loadCart(customer.customer_id);
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to remove this product.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  function openPayment() {
    if (!cart?.items.length) {
      setNotice({ tone: 'error', message: 'Cart is empty.' });
      return;
    }

    setPaymentForm(emptyPayment);
    setNotice(null);
    setView('payment');
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            category_id: Number(sellProductForm.category_id),
            name: sellProductForm.name,
            description: sellProductForm.description,
            price: sellProductForm.price,
            image_url: sellProductForm.image_url,
            product_condition: sellProductForm.product_condition,
            quantity: Number(sellProductForm.quantity),
          }),
        }),
      );

      setSellProductForm(emptySellProduct);
      await loadBaseData(session);
      setView('seller-products');
      setNotice({ tone: 'success', message: 'Your product is now listed for sale.' });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to list this product.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  function openAccountUpdate() {
    setAccountForm(customerToAccountForm(customer));
    setNotice(null);
    setView('account-update');
  }

  function updateProductForm(productId: number, changes: Partial<ProductEditForm>) {
    setProductEditForms((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || {}),
        ...changes,
      } as ProductEditForm,
    }));
  }

  async function updateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const updatedCustomer = await readJson<Customer>(
        await fetch('/api/customers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            ...accountForm,
          }),
        }),
      );

      const nextSession: Session = { kind: 'customer', customer: updatedCustomer };
      setSession(nextSession);
      setAccountForm(customerToAccountForm(updatedCustomer));
      await loadBaseData(nextSession);
      setView('settings');
      setNotice({ tone: 'success', message: 'Account details updated.' });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to update account.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function updateProduct(productId: number) {
    if (!customer) {
      return;
    }

    const form = productEditForms[productId];
    if (!form) {
      setNotice({ tone: 'error', message: 'Product form was not ready.' });
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            customer_id: customer.customer_id,
            category_id: Number(form.category_id),
            name: form.name,
            description: form.description,
            price: form.price,
            image_url: form.image_url,
            product_condition: form.product_condition,
            quantity: Number(form.quantity),
          }),
        }),
      );

      await loadBaseData(session);
      setNotice({ tone: 'success', message: 'Product details updated.' });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to update product.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmDelivery(orderId: number) {
    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'confirm_delivery',
            order_id: orderId,
            customer_id: customer.customer_id,
          }),
        }),
      );

      await loadBaseData(session);
      setNotice({
        tone: 'success',
        message: `Order #${orderId} is waiting for customer confirmation.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to confirm delivery.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmReceipt(orderId: number) {
    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'confirm_receipt',
            order_id: orderId,
            customer_id: customer.customer_id,
          }),
        }),
      );

      await loadBaseData(session);
      await loadWallet(customer.customer_id);
      setNotice({ tone: 'success', message: `Order #${orderId} confirmed.` });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to confirm receipt.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function withdrawCredit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const result = await readJson<{ message: string }>(
        await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            ...withdrawalForm,
          }),
        }),
      );

      await loadWallet(customer.customer_id);
      setWithdrawalForm({ amount: '', bank_account_name: '', iban: '' });
      setNotice({ tone: 'success', message: result.message });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to request withdrawal.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function completePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customer) {
      return;
    }

    const digits = paymentForm.card_number.replace(/\D/g, '');
    const requiresCardDetails = paymentForm.method !== 'Apple Pay';
    if (
      requiresCardDetails &&
      (digits.length < 12 || paymentForm.cvv.length < 3 || !paymentForm.expiry)
    ) {
      setNotice({ tone: 'error', message: 'Enter valid payment details.' });
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const order = await readJson<{ order_id: number; total_amount: number }>(
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            payment_method: paymentForm.method,
            payment_confirmed: true,
          }),
        }),
      );

      await loadBaseData(session);
      setView('shop');
      setNotice({
        tone: 'success',
        message: `Order #${order.order_id} paid and posted for ${formatMoney(
          order.total_amount,
        )}.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to place this order.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function cancelOrder(orderId: number) {
    setIsBusy(true);
    setNotice(null);

    try {
      await readJson(
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        }),
      );
      await loadBaseData(session);
      setNotice({ tone: 'success', message: `Order #${orderId} cancelled.` });
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to cancel this order.',
      });
    } finally {
      setIsBusy(false);
    }
  }

  if (view === 'signin' || view === 'signup') {
    return (
      <AuthLayout notice={notice}>
        {view === 'signin' ? (
          <SignInForm
            form={signInForm}
            isBusy={isBusy}
            onChange={setSignInForm}
            onSubmit={signIn}
            onShowSignup={() => {
              setNotice(null);
              setView('signup');
            }}
          />
        ) : (
          <SignUpForm
            form={signUpForm}
            isBusy={isBusy}
            onChange={setSignUpForm}
            onSubmit={signUp}
            onShowSignin={() => {
              setNotice(null);
              setView('signin');
            }}
          />
        )}
      </AuthLayout>
    );
  }

  if (view === 'payment') {
    return (
      <PaymentPage
        cart={cart}
        form={paymentForm}
        isBusy={isBusy}
        notice={notice}
        onBack={() => {
          setNotice(null);
          setView('shop');
        }}
        onChange={setPaymentForm}
        onSubmit={completePayment}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsPage
        customer={customer}
        isBusy={isBusy}
        notice={notice}
        orders={orders}
        tab={settingsTab}
        onBack={() => {
          setNotice(null);
          setView('shop');
        }}
        onConfirmReceipt={confirmReceipt}
        onEditAccount={openAccountUpdate}
        onOpenMyProducts={() => {
          setNotice(null);
          setView('seller-products');
        }}
        onRefresh={() => loadBaseData(session)}
        onSetTab={setSettingsTab}
        onSignOut={signOut}
      />
    );
  }

  if (view === 'account-update') {
    return (
      <AccountUpdatePage
        customer={customer}
        form={accountForm}
        isBusy={isBusy}
        notice={notice}
        onBack={() => {
          setNotice(null);
          setView('settings');
        }}
        onChange={setAccountForm}
        onRefresh={() => loadBaseData(session)}
        onSignOut={signOut}
        onSubmit={updateAccount}
      />
    );
  }

  if (view === 'seller-products') {
    return (
      <SellerProductsPage
        categories={categories}
        customer={customer}
        form={sellProductForm}
        isBusy={isBusy}
        notice={notice}
        orders={sellerOrders}
        productForms={productEditForms}
        products={myProducts}
        wallet={wallet}
        withdrawalForm={withdrawalForm}
        onBack={() => {
          setNotice(null);
          setView('settings');
        }}
        onChangeForm={setSellProductForm}
        onChangeProductForm={updateProductForm}
        onConfirmDelivery={confirmDelivery}
        onRefresh={() => loadBaseData(session)}
        onSignOut={signOut}
        onSubmitProduct={submitProduct}
        onUpdateProduct={updateProduct}
        onChangeWithdrawalForm={setWithdrawalForm}
        onWithdraw={withdrawCredit}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminPage
        isBusy={isBusy}
        isLoading={isLoading}
        notice={notice}
        customers={customers}
        orders={orders}
        products={products}
        session={session}
        summary={summary}
        onCancelOrder={cancelOrder}
        onRefresh={() => loadBaseData(session)}
        onSignOut={signOut}
      />
    );
  }

  return (
    <ShopPage
      cart={cart}
      categories={categories}
      customer={customer}
      isBusy={isBusy}
      isLoading={isLoading}
      notice={notice}
      orders={orders}
      products={visibleProducts}
      reviews={reviews}
      search={search}
      selectedCategory={selectedCategory}
      selectedProduct={selectedProduct}
      productReviews={productReviews}
      summary={summary}
      onAddToCart={addToCart}
      onChangeQuantity={changeQuantity}
      onCheckout={openPayment}
      onRefresh={() => loadBaseData(session)}
      onRemoveFromCart={removeFromCart}
      onSearch={setSearch}
      onSelectCategory={setSelectedCategory}
      onSettings={() => {
        setNotice(null);
        setView('settings');
      }}
      onConfirmReceipt={confirmReceipt}
      onOpenProduct={openProductDetails}
      onCloseProduct={() => setSelectedProduct(null)}
      onSignOut={signOut}
    />
  );
}

function AuthLayout({
  children,
  notice,
}: {
  children: ReactNode;
  notice: Notice | null;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-[#172033]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md border border-[#bfd7d1] bg-[#eef8f5] px-3 py-1 text-sm font-medium text-[#1e6f5c]">
            <Database className="h-4 w-4" />
            KFUPM Online Store
          </div>
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#101828] md:text-5xl">
              Campus merchandise, orders, inventory, and admin control in one web.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#647084]">
              The website uses the customer, product, cart, order, inventory, and review tables from your database design.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric icon={<Users className="h-4 w-4" />} label="Customers" />
            <MiniMetric icon={<ShoppingCart className="h-4 w-4" />} label="Checkout" />
            <MiniMetric icon={<ShieldCheck className="h-4 w-4" />} label="Admin" />
          </div>
        </div>

        <div>
          {notice ? <NoticeBox notice={notice} /> : null}
          {children}
        </div>
      </section>
    </main>
  );
}

function SignInForm({
  form,
  isBusy,
  onChange,
  onShowSignup,
  onSubmit,
}: {
  form: typeof emptySignIn;
  isBusy: boolean;
  onChange: (form: typeof emptySignIn) => void;
  onShowSignup: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="rounded-lg border border-[#dce3ee] bg-white p-6 shadow-sm" onSubmit={onSubmit}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#101828]">Sign In</h2>
          <p className="mt-1 text-sm text-[#647084]">Access the store workspace.</p>
        </div>
        <Lock className="h-5 w-5 text-[#1f7a68]" />
      </div>

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => onChange({ ...form, email: value })}
      />
      <Field
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) => onChange({ ...form, password: value })}
      />

      <button
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-4 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
        type="submit"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Sign In
      </button>

      <button
        className="mt-3 h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc]"
        type="button"
        onClick={onShowSignup}
      >
        Create Account
      </button>
    </form>
  );
}

function SignUpForm({
  form,
  isBusy,
  onChange,
  onShowSignin,
  onSubmit,
}: {
  form: typeof emptySignUp;
  isBusy: boolean;
  onChange: (form: typeof emptySignUp) => void;
  onShowSignin: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="rounded-lg border border-[#dce3ee] bg-white p-6 shadow-sm" onSubmit={onSubmit}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#101828]">Sign Up</h2>
          <p className="mt-1 text-sm text-[#647084]">Create a customer account.</p>
        </div>
        <UserPlus className="h-5 w-5 text-[#1f7a68]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" value={form.first_name} onChange={(value) => onChange({ ...form, first_name: value })} />
        <Field label="Last name" value={form.last_name} onChange={(value) => onChange({ ...form, last_name: value })} />
      </div>
      <Field label="Email" type="email" value={form.email} onChange={(value) => onChange({ ...form, email: value })} />
      <Field label="Password" type="password" value={form.password} onChange={(value) => onChange({ ...form, password: value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone" value={form.phone} onChange={(value) => onChange({ ...form, phone: value })} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#3d4656]">Role</span>
          <select
            className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
            value={form.role}
            onChange={(event) => onChange({ ...form, role: event.target.value })}
          >
            <option value="student">student</option>
            <option value="staff">staff</option>
            <option value="teacher">teacher</option>
          </select>
        </label>
      </div>
      <Field label="Street" value={form.street} onChange={(value) => onChange({ ...form, street: value })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="City" value={form.city} onChange={(value) => onChange({ ...form, city: value })} />
        <Field label="Country" value={form.country} onChange={(value) => onChange({ ...form, country: value })} />
        <Field label="Postal code" value={form.postal_code} onChange={(value) => onChange({ ...form, postal_code: value })} />
      </div>

      <button
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-4 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
        type="submit"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create Account
      </button>
      <button
        className="mt-3 h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc]"
        type="button"
        onClick={onShowSignin}
      >
        Back to Sign In
      </button>
    </form>
  );
}

function ShopPage({
  cart,
  categories,
  customer,
  isBusy,
  isLoading,
  notice,
  onAddToCart,
  onChangeQuantity,
  onCheckout,
  onRefresh,
  onRemoveFromCart,
  onSearch,
  onSelectCategory,
  onSettings,
  onConfirmReceipt,
  onOpenProduct,
  onCloseProduct,
  onSignOut,
  orders,
  products,
  reviews,
  search,
  selectedCategory,
  selectedProduct,
  productReviews,
  summary,
}: {
  cart: Cart | null;
  categories: Category[];
  customer: Customer | null;
  isBusy: boolean;
  isLoading: boolean;
  notice: Notice | null;
  orders: Order[];
  products: Product[];
  reviews: Review[];
  search: string;
  selectedCategory: number | 'all';
  selectedProduct: Product | null;
  productReviews: Review[];
  summary: Summary | null;
  onAddToCart: (productId: number) => void;
  onChangeQuantity: (item: CartItem, quantity: number) => void;
  onCheckout: () => void;
  onRefresh: () => void;
  onRemoveFromCart: (productId: number) => void;
  onSearch: (value: string) => void;
  onSelectCategory: (value: number | 'all') => void;
  onSettings: () => void;
  onConfirmReceipt: (orderId: number) => void;
  onOpenProduct: (product: Product) => void;
  onCloseProduct: () => void;
  onSignOut: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <AppHeader
        actionLabel="Sign Out"
        icon={<LogOut className="h-4 w-4" />}
        subtitle={customer ? `${customer.first_name} ${customer.last_name} - ${customer.role}` : 'Customer'}
        title="Store Catalog"
        onAction={onSignOut}
        onRefresh={onRefresh}
        onSecondaryAction={onSettings}
        secondaryIcon={<Settings className="h-4 w-4" />}
        secondaryLabel="Settings"
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <CatalogToolbar
            categories={categories}
            search={search}
            selectedCategory={selectedCategory}
            onSearch={onSearch}
            onSelectCategory={onSelectCategory}
          />

          {notice ? <NoticeBox notice={notice} /> : null}

          {isLoading ? (
            <LoadingPanel />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  isBusy={isBusy}
                  key={product.product_id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenProduct={onOpenProduct}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <CartPanel
            cart={cart}
            isBusy={isBusy}
            onChangeQuantity={onChangeQuantity}
            onCheckout={onCheckout}
            onRemoveFromCart={onRemoveFromCart}
          />
          <OrdersPanel
            isBusy={isBusy}
            orders={orders}
            onConfirmReceipt={onConfirmReceipt}
          />
        </aside>
      </section>

      <BottomInfo categories={categories} reviews={reviews} />
      <ProductReviewsModal
        product={selectedProduct}
        reviews={productReviews}
        onClose={onCloseProduct}
      />
    </main>
  );
}

function PaymentPage({
  cart,
  form,
  isBusy,
  notice,
  onBack,
  onChange,
  onSubmit,
}: {
  cart: Cart | null;
  form: typeof emptyPayment;
  isBusy: boolean;
  notice: Notice | null;
  onBack: () => void;
  onChange: (form: typeof emptyPayment) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-[#172033]">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_360px]">
        <form className="rounded-lg border border-[#dce3ee] bg-white p-6 shadow-sm" onSubmit={onSubmit}>
          <button
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f8fafc]"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-[#101828]">Payment</h1>
            <p className="mt-2 text-sm text-[#647084]">Submit the payment form to create the order.</p>
          </div>
          {notice ? <NoticeBox notice={notice} /> : null}
          {form.method === 'Apple Pay' ? <ApplePayMotion /> : null}
          <Field label="Cardholder name" value={form.card_name} onChange={(value) => onChange({ ...form, card_name: value })} />
          <Field label="Card number" inputMode="numeric" value={form.card_number} onChange={(value) => onChange({ ...form, card_number: value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Expiry" value={form.expiry} placeholder="12/28" onChange={(value) => onChange({ ...form, expiry: value })} />
            <Field label="CVV" inputMode="numeric" value={form.cvv} onChange={(value) => onChange({ ...form, cvv: value })} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#3d4656]">Method</span>
              <select
                className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
                value={form.method}
                onChange={(event) => onChange({ ...form, method: event.target.value })}
              >
                <option>Credit Card</option>
                <option>Mada</option>
                <option>Apple Pay</option>
              </select>
            </label>
          </div>
          <button
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#2b5c9e] px-4 text-sm font-semibold text-white transition hover:bg-[#244f89] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy || !cart?.items.length}
            type="submit"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay and Post Order
          </button>
        </form>

        <div className="h-fit rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#101828]">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart?.items.map((item) => (
              <div className="flex justify-between gap-3 text-sm" key={item.product_id}>
                <span className="text-[#647084]">{item.name} x{item.quantity}</span>
                <span className="font-semibold text-[#101828]">{formatMoney(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[#e6ebf2] pt-4">
            <div className="flex justify-between">
              <span className="font-medium text-[#647084]">Total</span>
              <span className="text-2xl font-semibold text-[#101828]">{formatMoney(cart?.total ?? 0)}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminPage({
  customers,
  isBusy,
  isLoading,
  notice,
  onCancelOrder,
  onRefresh,
  onSignOut,
  orders,
  products,
  session,
  summary,
}: {
  customers: Customer[];
  isBusy: boolean;
  isLoading: boolean;
  notice: Notice | null;
  orders: Order[];
  products: Product[];
  session: Session | null;
  summary: Summary | null;
  onCancelOrder: (orderId: number) => void;
  onRefresh: () => void;
  onSignOut: () => void;
}) {
  const lowStockProducts = products.filter(
    (product) => product.stock_status === 'low' || product.stock_status === 'out',
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <AppHeader
        actionLabel="Sign Out"
        icon={<LogOut className="h-4 w-4" />}
        subtitle={session?.kind === 'admin' ? session.admin.email : 'Admin'}
        title="Admin Dashboard"
        onAction={onSignOut}
        onRefresh={onRefresh}
      />
      <Stats showRevenue summary={summary} />
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[#dce3ee] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6ebf2] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#101828]">Orders</h2>
            <PackageCheck className="h-5 w-5 text-[#2b5c9e]" />
          </div>
          {notice ? <div className="p-5 pb-0"><NoticeBox notice={notice} /></div> : null}
          {isLoading ? (
            <LoadingPanel />
          ) : (
            <div className="divide-y divide-[#eef2f6]">
              {orders.map((order) => (
                <article className="p-5" key={order.order_id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#101828]">Order #{order.order_id}</h3>
                      <p className="mt-1 text-sm text-[#647084]">{order.customer_name}</p>
                      <p className="mt-2 text-sm text-[#647084]">{order.items || 'No line items'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusTone(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusTone(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className="rounded-md bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#465468]">
                        {formatMoney(order.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-[#647084]">{order.payment_method}</span>
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#efc0c3] bg-white px-3 text-sm font-semibold text-[#b42335] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy || order.order_status === 'cancelled'}
                      type="button"
                      onClick={() => onCancelOrder(order.order_id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="h-fit rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#101828]">Inventory Watch</h2>
            <Boxes className="h-5 w-5 text-[#1f7a68]" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3" key={product.product_id}>
                <div className="flex justify-between gap-3">
                  <span className="text-sm font-semibold text-[#101828]">{product.name}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${stockTone(product.stock_status)}`}>
                    {stockLabel(product.stock_status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#647084]">{product.quantity_in_stock} in stock</p>
              </div>
            ))}
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-[#647084]">Inventory levels are healthy.</p>
            ) : null}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-10">
        <AccountsPanel customers={customers} orders={orders} />
      </section>
    </main>
  );
}

function SettingsPage({
  customer,
  isBusy,
  notice,
  onBack,
  onConfirmReceipt,
  onEditAccount,
  onOpenMyProducts,
  onRefresh,
  onSetTab,
  onSignOut,
  orders,
  tab,
}: {
  customer: Customer | null;
  isBusy: boolean;
  notice: Notice | null;
  orders: Order[];
  tab: SettingsTab;
  onBack: () => void;
  onConfirmReceipt: (orderId: number) => void;
  onEditAccount: () => void;
  onOpenMyProducts: () => void;
  onRefresh: () => void;
  onSetTab: (tab: SettingsTab) => void;
  onSignOut: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <AppHeader
        actionLabel="Sign Out"
        icon={<LogOut className="h-4 w-4" />}
        subtitle={customer ? `${customer.first_name} ${customer.last_name}` : 'Customer settings'}
        title="Settings"
        onAction={onSignOut}
        onRefresh={onRefresh}
        onSecondaryAction={onBack}
        secondaryIcon={<ArrowLeft className="h-4 w-4" />}
        secondaryLabel="Back"
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg border border-[#dce3ee] bg-white p-3 shadow-sm">
          <SettingsTabButton
            active={tab === 'account'}
            icon={<User className="h-4 w-4" />}
            label="Account"
            onClick={() => onSetTab('account')}
          />
          <SettingsTabButton
            active={tab === 'orders'}
            icon={<PackageCheck className="h-4 w-4" />}
            label="Orders"
            onClick={() => onSetTab('orders')}
          />
          <SettingsTabButton
            active={false}
            icon={<ShoppingBag className="h-4 w-4" />}
            label="My Products"
            onClick={onOpenMyProducts}
          />
        </aside>

        <div className="space-y-5">
          {notice ? <NoticeBox notice={notice} /> : null}
          {tab === 'account' ? (
            <AccountSettings customer={customer} onEdit={onEditAccount} />
          ) : null}
          {tab === 'orders' ? <OrdersPanel isBusy={isBusy} orders={orders} onConfirmReceipt={onConfirmReceipt} /> : null}
        </div>
      </section>
    </main>
  );
}

function SettingsTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`mb-2 flex h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold transition ${
        active
          ? 'bg-[#1f7a68] text-white'
          : 'text-[#435066] hover:bg-[#f8fafc]'
      }`}
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function AccountSettings({
  customer,
  onEdit,
}: {
  customer: Customer | null;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#101828]">Account</h2>
          <p className="mt-1 text-sm text-[#647084]">Review your profile, username, password, and location.</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-3 text-sm font-semibold text-white transition hover:bg-[#196858]"
          type="button"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
          Update
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ReadOnlyField label="First Name" value={customer?.first_name} />
        <ReadOnlyField label="Last Name" value={customer?.last_name} />
        <ReadOnlyField label="Username" value={customer?.email} />
        <ReadOnlyField label="Password" value="Hidden" />
        <ReadOnlyField label="Phone" value={customer?.phone || 'Not set'} />
        <ReadOnlyField label="Role" value={customer?.role} />
        <ReadOnlyField label="Street" value={customer?.street || 'Not set'} />
        <ReadOnlyField
          label="Location"
          value={[customer?.city, customer?.country].filter(Boolean).join(', ') || 'Not set'}
        />
      </div>
    </section>
  );
}

function AccountUpdatePage({
  customer,
  form,
  isBusy,
  notice,
  onBack,
  onChange,
  onRefresh,
  onSignOut,
  onSubmit,
}: {
  customer: Customer | null;
  form: AccountForm;
  isBusy: boolean;
  notice: Notice | null;
  onBack: () => void;
  onChange: (form: AccountForm) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <AppHeader
        actionLabel="Sign Out"
        icon={<LogOut className="h-4 w-4" />}
        subtitle={customer ? `${customer.first_name} ${customer.last_name}` : 'Update account'}
        title="Update Account"
        onAction={onSignOut}
        onRefresh={onRefresh}
        onSecondaryAction={onBack}
        secondaryIcon={<ArrowLeft className="h-4 w-4" />}
        secondaryLabel="Settings"
      />

      <section className="mx-auto max-w-3xl px-5 py-6">
        {notice ? <NoticeBox notice={notice} /> : null}
        <form className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm" onSubmit={onSubmit}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#101828]">Account Details</h2>
              <p className="mt-1 text-sm text-[#647084]">Update your profile, login username, and delivery location.</p>
            </div>
            <User className="h-5 w-5 text-[#1f7a68]" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="First Name" value={form.first_name} onChange={(value) => onChange({ ...form, first_name: value })} />
            <Field label="Last Name" value={form.last_name} onChange={(value) => onChange({ ...form, last_name: value })} />
            <Field label="Username / Email" type="email" value={form.email} onChange={(value) => onChange({ ...form, email: value })} />
            <Field label="New Password" type="password" placeholder="Leave blank to keep current password" value={form.password} onChange={(value) => onChange({ ...form, password: value })} />
            <Field label="Phone" value={form.phone} onChange={(value) => onChange({ ...form, phone: value })} />
            <label className="mb-3 block">
              <span className="mb-2 block text-sm font-medium text-[#3d4656]">Role</span>
              <select
                className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
                value={form.role}
                onChange={(event) => onChange({ ...form, role: event.target.value })}
              >
                <option value="student">student</option>
                <option value="staff">staff</option>
                <option value="teacher">teacher</option>
              </select>
            </label>
            <Field label="Street" value={form.street} onChange={(value) => onChange({ ...form, street: value })} />
            <Field label="City" value={form.city} onChange={(value) => onChange({ ...form, city: value })} />
            <Field label="Country" value={form.country} onChange={(value) => onChange({ ...form, country: value })} />
            <Field label="Postal Code" value={form.postal_code} onChange={(value) => onChange({ ...form, postal_code: value })} />
          </div>

          <button
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-4 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Account
          </button>
        </form>
      </section>
    </main>
  );
}

function SellerProductsPage({
  categories,
  customer,
  form,
  isBusy,
  notice,
  onBack,
  onChangeForm,
  onChangeProductForm,
  onConfirmDelivery,
  onRefresh,
  onSignOut,
  onSubmitProduct,
  onUpdateProduct,
  onChangeWithdrawalForm,
  onWithdraw,
  orders,
  productForms,
  products,
  wallet,
  withdrawalForm,
}: {
  categories: Category[];
  customer: Customer | null;
  form: typeof emptySellProduct;
  isBusy: boolean;
  notice: Notice | null;
  orders: Order[];
  productForms: Record<number, ProductEditForm>;
  products: Product[];
  wallet: SellerWallet | null;
  withdrawalForm: {
    amount: string;
    bank_account_name: string;
    iban: string;
  };
  onBack: () => void;
  onChangeForm: (form: typeof emptySellProduct) => void;
  onChangeProductForm: (productId: number, changes: Partial<ProductEditForm>) => void;
  onConfirmDelivery: (orderId: number) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  onSubmitProduct: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateProduct: (productId: number) => void;
  onChangeWithdrawalForm: (form: {
    amount: string;
    bank_account_name: string;
    iban: string;
  }) => void;
  onWithdraw: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <AppHeader
        actionLabel="Sign Out"
        icon={<LogOut className="h-4 w-4" />}
        subtitle={customer ? `${customer.first_name} ${customer.last_name}` : 'Seller products'}
        title="My Products"
        onAction={onSignOut}
        onRefresh={onRefresh}
        onSecondaryAction={onBack}
        secondaryIcon={<ArrowLeft className="h-4 w-4" />}
        secondaryLabel="Settings"
      />

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[380px_1fr]">
        <form className="h-fit rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm" onSubmit={onSubmitProduct}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#101828]">Sell Product</h2>
              <p className="mt-1 text-sm text-[#647084]">Add a picture URL, condition, price, and quantity.</p>
            </div>
            <ImagePlus className="h-5 w-5 text-[#1f7a68]" />
          </div>

          <Field label="Product name" value={form.name} onChange={(value) => onChangeForm({ ...form, name: value })} />
          <CategorySelect
            categories={categories}
            value={form.category_id}
            onChange={(value) => onChangeForm({ ...form, category_id: value })}
          />
          <Field label="Description" value={form.description} onChange={(value) => onChangeForm({ ...form, description: value })} />
          <Field label="Picture URL" value={form.image_url} onChange={(value) => onChangeForm({ ...form, image_url: value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Price" inputMode="numeric" value={form.price} onChange={(value) => onChangeForm({ ...form, price: value })} />
            <Field label="Quantity" inputMode="numeric" value={form.quantity} onChange={(value) => onChangeForm({ ...form, quantity: value })} />
            <ConditionSelect
              value={form.product_condition}
              onChange={(value) => onChangeForm({ ...form, product_condition: value })}
            />
          </div>
          <button
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-4 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            List for Sale
          </button>
        </form>

        <div className="space-y-5">
          {notice ? <NoticeBox notice={notice} /> : null}
          <section className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#101828]">Listed Products</h2>
                <p className="mt-1 text-sm text-[#647084]">Modify your product details and stock.</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-[#2b5c9e]" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {products.map((product) => {
                const editForm = productForms[product.product_id] || productToEditForm(product);

                return (
                  <article className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-4" key={product.product_id}>
                    <div className="mb-4 flex gap-3">
                      <ImageWithFallback
                        className="h-20 w-20 shrink-0 rounded-md object-cover"
                        src={productImage(product)}
                        alt={product.name}
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#101828]">{product.name}</h3>
                        <p className="mt-1 text-xs text-[#647084]">{product.category_name}</p>
                        <span className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${stockTone(product.stock_status)}`}>
                          {stockLabel(product.stock_status)}
                        </span>
                      </div>
                    </div>

                    <Field label="Product name" value={editForm.name} onChange={(value) => onChangeProductForm(product.product_id, { name: value })} />
                    <CategorySelect
                      categories={categories}
                      value={editForm.category_id}
                      onChange={(value) => onChangeProductForm(product.product_id, { category_id: value })}
                    />
                    <Field label="Description" value={editForm.description} onChange={(value) => onChangeProductForm(product.product_id, { description: value })} />
                    <Field label="Picture URL" value={editForm.image_url} onChange={(value) => onChangeProductForm(product.product_id, { image_url: value })} />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Price" inputMode="numeric" value={editForm.price} onChange={(value) => onChangeProductForm(product.product_id, { price: value })} />
                      <Field label="Quantity" inputMode="numeric" value={editForm.quantity} onChange={(value) => onChangeProductForm(product.product_id, { quantity: value })} />
                      <ConditionSelect
                        value={editForm.product_condition}
                        onChange={(value) => onChangeProductForm(product.product_id, { product_condition: value })}
                      />
                    </div>
                    <button
                      className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2b5c9e] px-3 text-sm font-semibold text-white transition hover:bg-[#244f89] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy}
                      type="button"
                      onClick={() => onUpdateProduct(product.product_id)}
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Product
                    </button>
                  </article>
                );
              })}
            </div>
            {products.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-md border border-[#e2e8f0] bg-[#fbfcfe] px-4 text-center text-sm text-[#647084]">
                You have not listed any products yet.
              </div>
            ) : null}
          </section>

          <div className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#101828]">Seller Credit</h2>
                <p className="mt-1 text-sm text-[#647084]">Withdrawals take 4 working days.</p>
              </div>
              <CreditCard className="h-5 w-5 text-[#1f7a68]" />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <ReadOnlyField label="Available" value={formatMoney(wallet?.available_balance ?? 0)} />
              <ReadOnlyField label="Pending" value={formatMoney(wallet?.pending_balance ?? 0)} />
              <ReadOnlyField label="Total withdrawn" value={formatMoney(wallet?.total_withdrawn ?? 0)} />
            </div>

            <form className="mt-5 grid gap-3 md:grid-cols-3" onSubmit={onWithdraw}>
              <Field label="Amount" inputMode="numeric" value={withdrawalForm.amount} onChange={(value) => onChangeWithdrawalForm({ ...withdrawalForm, amount: value })} />
              <Field label="Account name" value={withdrawalForm.bank_account_name} onChange={(value) => onChangeWithdrawalForm({ ...withdrawalForm, bank_account_name: value })} />
              <Field label="IBAN" value={withdrawalForm.iban} onChange={(value) => onChangeWithdrawalForm({ ...withdrawalForm, iban: value })} />
              <div className="md:col-span-3">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2b5c9e] px-4 text-sm font-semibold text-white transition hover:bg-[#244f89] disabled:opacity-60"
                  disabled={isBusy}
                  type="submit"
                >
                  <CreditCard className="h-4 w-4" />
                  Withdraw to bank account
                </button>
              </div>
            </form>
          </div>

          <section className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#101828]">Product Orders</h2>
                <p className="mt-1 text-sm text-[#647084]">Track buyers, contact them, and confirm delivery.</p>
              </div>
              <Truck className="h-5 w-5 text-[#1f7a68]" />
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <article className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-4" key={order.order_id}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#101828]">Order #{order.order_id}</h3>
                      <p className="mt-1 text-sm text-[#647084]">{order.items || 'No line items'}</p>
                      <p className="mt-2 text-xs font-medium text-[#526071]">
                        Buyer: {order.customer_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${statusTone(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#2b5c9e]">
                        {formatMoney(order.seller_total_amount ?? order.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.customer_email ? (
                      <a
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-semibold text-[#344054] transition hover:bg-[#f8fafc]"
                        href={`mailto:${order.customer_email}`}
                      >
                        <Mail className="h-4 w-4" />
                        Email Buyer
                      </a>
                    ) : null}
                    {order.customer_phone ? (
                      <a
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-semibold text-[#344054] transition hover:bg-[#f8fafc]"
                        href={`tel:${order.customer_phone}`}
                      >
                        <Phone className="h-4 w-4" />
                        Call Buyer
                      </a>
                    ) : null}
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-3 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy || ['awaiting_customer_confirmation', 'delivered', 'cancelled'].includes(order.order_status)}
                      type="button"
                      onClick={() => onConfirmDelivery(order.order_id)}
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                      Confirm Delivery
                    </button>
                  </div>
                </article>
              ))}
              {orders.length === 0 ? (
                <div className="flex min-h-24 items-center justify-center rounded-md border border-[#e2e8f0] bg-[#fbfcfe] px-4 text-center text-sm text-[#647084]">
                  No buyer orders for your products yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function AccountsPanel({
  customers,
  orders,
}: {
  customers: Customer[];
  orders: Order[];
}) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e6ebf2] px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-[#101828]">Accounts</h2>
          <p className="mt-1 text-sm text-[#647084]">Customer creation dates and order history.</p>
        </div>
        <Users className="h-5 w-5 text-[#1f7a68]" />
      </div>

      <div className="divide-y divide-[#eef2f6]">
        {customers.map((customer) => {
          const customerOrders = orders.filter(
            (order) => order.customer_id === customer.customer_id,
          );

          return (
            <article className="grid gap-4 p-5 lg:grid-cols-[320px_1fr]" key={customer.customer_id}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#101828]">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-[#647084]">{customer.email}</p>
                  </div>
                  <span className="rounded-md bg-[#eef8f5] px-2 py-1 text-xs font-semibold capitalize text-[#1f765f]">
                    {customer.role}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3">
                    <span className="block text-xs font-medium text-[#647084]">Created</span>
                    <span className="mt-1 block font-semibold text-[#101828]">
                      {formatDate(customer.created_at)}
                    </span>
                  </div>
                  <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3">
                    <span className="block text-xs font-medium text-[#647084]">Orders</span>
                    <span className="mt-1 block font-semibold text-[#101828]">
                      {customer.order_count ?? customerOrders.length}
                    </span>
                  </div>
                  <div className="col-span-2 rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3">
                    <span className="block text-xs font-medium text-[#647084]">Total Spent</span>
                    <span className="mt-1 block font-semibold text-[#101828]">
                      {formatMoney(customer.total_spent ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe]">
                {customerOrders.length ? (
                  <div className="divide-y divide-[#e2e8f0]">
                    {customerOrders.map((order) => (
                      <div className="p-3" key={order.order_id}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#101828]">
                              Order #{order.order_id}
                            </p>
                            <p className="mt-1 text-xs text-[#647084]">
                              {order.items || 'No line items'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${statusTone(order.order_status)}`}>
                              {order.order_status}
                            </span>
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${statusTone(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#2b5c9e]">
                              {formatMoney(order.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-24 items-center justify-center px-4 text-center text-sm text-[#647084]">
                    No orders for this account.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AppHeader({
  actionLabel,
  icon,
  onAction,
  onRefresh,
  onSecondaryAction,
  secondaryIcon,
  secondaryLabel,
  subtitle,
  title,
}: {
  actionLabel: string;
  icon: ReactNode;
  onAction: () => void;
  onRefresh: () => void;
  onSecondaryAction?: () => void;
  secondaryIcon?: ReactNode;
  secondaryLabel?: string;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="border-b border-[#dce3ee] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-[#bfd7d1] bg-[#eef8f5] px-3 py-1 text-sm font-medium text-[#1e6f5c]">
            <Database className="h-4 w-4" />
            KFUPM Online Store
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-[#101828] md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-[#647084]">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {onSecondaryAction ? (
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-4 text-sm font-medium text-[#1f2937] shadow-sm transition hover:border-[#96a7bd] hover:bg-[#f8fafc]"
              type="button"
              onClick={onSecondaryAction}
            >
              {secondaryIcon}
              {secondaryLabel}
            </button>
          ) : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-4 text-sm font-medium text-[#1f2937] shadow-sm transition hover:border-[#96a7bd] hover:bg-[#f8fafc]"
            type="button"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#172033] px-4 text-sm font-semibold text-white transition hover:bg-[#29354a]"
            type="button"
            onClick={onAction}
          >
            {icon}
            {actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function Stats({
  showRevenue,
  summary,
}: {
  showRevenue: boolean;
  summary: Summary | null;
}) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-5 md:grid-cols-4">
      <StatTile icon={<BookOpen className="h-5 w-5" />} label="Products" value={summary?.active_products ?? 0} />
      <StatTile icon={<PackageCheck className="h-5 w-5" />} label="Orders" value={summary?.total_orders ?? 0} />
      {showRevenue ? (
        <StatTile icon={<CreditCard className="h-5 w-5" />} label="Revenue" value={formatMoney(summary?.revenue ?? 0)} />
      ) : (
        <StatTile icon={<Users className="h-5 w-5" />} label="Customers" value={summary?.total_customers ?? 0} />
      )}
      <StatTile icon={<Boxes className="h-5 w-5" />} label="Low Stock" value={(summary?.low_stock ?? 0) + (summary?.out_of_stock ?? 0)} />
    </section>
  );
}

function CatalogToolbar({
  categories,
  onSearch,
  onSelectCategory,
  search,
  selectedCategory,
}: {
  categories: Category[];
  search: string;
  selectedCategory: number | 'all';
  onSearch: (value: string) => void;
  onSelectCategory: (value: number | 'all') => void;
}) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={`h-10 rounded-md border px-4 text-sm font-medium transition ${
              selectedCategory === 'all'
                ? 'border-[#1f7a68] bg-[#1f7a68] text-white'
                : 'border-[#cbd5e1] bg-white text-[#435066] hover:bg-[#f8fafc]'
            }`}
            type="button"
            onClick={() => onSelectCategory('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className={`h-10 rounded-md border px-4 text-sm font-medium transition ${
                selectedCategory === category.category_id
                  ? 'border-[#1f7a68] bg-[#1f7a68] text-white'
                  : 'border-[#cbd5e1] bg-white text-[#435066] hover:bg-[#f8fafc]'
              }`}
              key={category.category_id}
              type="button"
              onClick={() => onSelectCategory(category.category_id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <label className="relative block min-w-0 lg:w-72">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#748096]" />
          <input
            className="h-10 w-full rounded-md border border-[#cbd5e1] bg-[#fbfcfe] pl-9 pr-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
            placeholder="Search catalog"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function ProductCard({
  isBusy,
  onAddToCart,
  onOpenProduct,
  product,
  showAction = true,
}: {
  isBusy: boolean;
  product: Product;
  onAddToCart: (productId: number) => void;
  onOpenProduct?: (product: Product) => void;
  showAction?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#dce3ee] bg-white shadow-sm">
      <button
        className="aspect-[16/10] w-full overflow-hidden bg-[#dfe7f2]"
        type="button"
        onClick={() => onOpenProduct?.(product)}
      >
        <ImageWithFallback
          className="h-full w-full object-cover"
          src={productImage(product)}
          alt={product.name}
        />
      </button>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-sm font-medium text-[#1f7a68]">{product.category_name}</span>
            <button
              className="mt-1 truncate text-left text-lg font-semibold text-[#101828] transition hover:text-[#1f7a68]"
              type="button"
              onClick={() => onOpenProduct?.(product)}
            >
              {product.name}
            </button>
          </div>
          <span className="whitespace-nowrap text-lg font-semibold text-[#2b5c9e]">{formatMoney(product.price)}</span>
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-[#647084]">{product.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[#d6deea] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold capitalize text-[#465468]">
            {product.product_condition}
          </span>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${stockTone(product.stock_status)}`}>
            {stockLabel(product.stock_status)}
          </span>
          <span className="rounded-md border border-[#d6deea] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#465468]">
            {product.quantity_in_stock} in stock
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-[#f1d79b] bg-[#fff9e8] px-2.5 py-1 text-xs font-semibold text-[#7a5a00]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {Number(product.average_rating).toFixed(1)}
          </span>
        </div>
        {product.seller_name ? (
          <p className="truncate text-xs font-medium text-[#647084]">
            Seller: {product.seller_name}
          </p>
        ) : null}
        {showAction ? (
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-4 text-sm font-semibold text-white transition hover:bg-[#196858] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy || product.stock_status === 'out' || product.quantity_in_stock < 1}
            type="button"
            onClick={() => onAddToCart(product.product_id)}
          >
            <Plus className="h-4 w-4" />
            Add to Cart
          </button>
        ) : null}
      </div>
    </article>
  );
}

function CartPanel({
  cart,
  isBusy,
  onChangeQuantity,
  onCheckout,
  onRemoveFromCart,
}: {
  cart: Cart | null;
  isBusy: boolean;
  onChangeQuantity: (item: CartItem, quantity: number) => void;
  onCheckout: () => void;
  onRemoveFromCart: (productId: number) => void;
}) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e6ebf2] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#101828]">Cart</h2>
        <ShoppingCart className="h-5 w-5 text-[#1f7a68]" />
      </div>
      <div className="divide-y divide-[#eef2f6]">
        {cart?.items.length ? (
          cart.items.map((item) => (
            <div className="px-5 py-4" key={item.product_id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[#172033]">{item.name}</h3>
                  <p className="mt-1 text-sm text-[#647084]">{formatMoney(item.price)}</p>
                </div>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#efc0c3] bg-white text-[#b42335] transition hover:bg-[#fff1f2]"
                  aria-label={`Remove ${item.name}`}
                  disabled={isBusy}
                  type="button"
                  onClick={() => onRemoveFromCart(item.product_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex h-9 items-center rounded-md border border-[#cbd5e1] bg-white">
                  <button className="inline-flex h-9 w-9 items-center justify-center text-[#42506a] hover:bg-[#f8fafc]" disabled={isBusy} type="button" onClick={() => onChangeQuantity(item, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-9 text-center text-sm font-semibold">{item.quantity}</span>
                  <button className="inline-flex h-9 w-9 items-center justify-center text-[#42506a] hover:bg-[#f8fafc]" disabled={isBusy} type="button" onClick={() => onChangeQuantity(item, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-[#101828]">{formatMoney(item.line_total)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center text-sm text-[#647084]">Cart is empty.</div>
        )}
      </div>
      <div className="border-t border-[#e6ebf2] p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-[#647084]">Total</span>
          <span className="text-2xl font-semibold text-[#101828]">{formatMoney(cart?.total ?? 0)}</span>
        </div>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#2b5c9e] px-4 text-sm font-semibold text-white transition hover:bg-[#244f89] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy || !cart?.items.length}
          type="button"
          onClick={onCheckout}
        >
          <CreditCard className="h-4 w-4" />
          Checkout
        </button>
      </div>
    </div>
  );
}

function OrdersPanel({
  isBusy,
  onConfirmReceipt,
  orders,
}: {
  isBusy: boolean;
  onConfirmReceipt: (orderId: number) => void;
  orders: Order[];
}) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#101828]">My Orders</h2>
        <PackageCheck className="h-5 w-5 text-[#2b5c9e]" />
      </div>
      <div className="space-y-3">
        {orders.slice(0, 5).map((order) => (
          <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3" key={order.order_id}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#172033]">Order #{order.order_id}</span>
              <span className="text-sm font-semibold text-[#2b5c9e]">{formatMoney(order.total_amount)}</span>
            </div>
            <p className="mt-2 truncate text-xs text-[#647084]">{order.items || 'No line items'}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-md px-2 py-1 capitalize ${statusTone(order.order_status)}`}>{order.order_status}</span>
              <span className={`rounded-md px-2 py-1 capitalize ${statusTone(order.payment_status)}`}>{order.payment_status}</span>
            </div>
            {order.seller_confirmed_delivery_at && !order.buyer_confirmed_delivery_at ? (
              <button
                className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1f7a68] px-3 text-xs font-semibold text-white transition hover:bg-[#186454] disabled:opacity-60"
                disabled={isBusy}
                type="button"
                onClick={() => onConfirmReceipt(order.order_id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm receipt
              </button>
            ) : null}
          </div>
        ))}
        {orders.length === 0 ? <p className="text-sm text-[#647084]">No orders yet.</p> : null}
      </div>
    </div>
  );
}

function CategorySelect({
  categories,
  onChange,
  value,
}: {
  categories: Category[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-2 block text-sm font-medium text-[#3d4656]">Category</span>
      <select
        className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose category</option>
        {categories.map((category) => (
          <option key={category.category_id} value={category.category_id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConditionSelect({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-2 block text-sm font-medium text-[#3d4656]">Condition</span>
      <select
        className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="new">new</option>
        <option value="used">used</option>
      </select>
    </label>
  );
}

function ProductReviewsModal({
  product,
  reviews,
  onClose,
}: {
  product: Product | null;
  reviews: Review[];
  onClose: () => void;
}) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#101828]">{product.name}</h2>
            <p className="mt-1 text-sm text-[#647084]">{product.description}</p>
          </div>
          <button className="rounded-md border border-[#dce3ee] p-2" type="button" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#647084]">Price</span>
            <span className="text-lg font-semibold text-[#101828]">{formatMoney(product.price)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-[#647084]">Rating</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a5a00]">
              <Star className="h-4 w-4 fill-current" />
              {Number(product.average_rating).toFixed(1)} ({product.review_count})
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.length ? reviews.map((review) => (
            <article className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-4" key={review.review_id}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#172033]">{review.customer_name}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a5a00]">
                  <Star className="h-4 w-4 fill-current" />
                  {review.rating}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#647084]">{review.comment}</p>
            </article>
          )) : (
            <p className="text-sm text-[#647084]">No reviews yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BottomInfo({ categories, reviews }: { categories: Category[]; reviews: Review[] }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 lg:grid-cols-2">
      <div className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#101828]">Categories</h2>
          <Boxes className="h-5 w-5 text-[#1f7a68]" />
        </div>
        <div className="overflow-hidden rounded-md border border-[#e2e8f0]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f8fafc] text-[#526071]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Parent</th>
                <th className="px-4 py-3 text-right font-semibold">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {categories.map((category) => (
                <tr key={category.category_id}>
                  <td className="px-4 py-3 font-medium text-[#172033]">{category.name}</td>
                  <td className="px-4 py-3 text-[#647084]">{category.parent_name || 'Root'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#2b5c9e]">{category.product_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[#dce3ee] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#101828]">Reviews</h2>
          <Star className="h-5 w-5 text-[#7a5a00]" />
        </div>
        <div className="space-y-3">
          {reviews.map((review) => (
            <article className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-4" key={review.review_id}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-semibold text-[#172033]">{review.product_name}</h3>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a5a00]">
                  <Star className="h-4 w-4 fill-current" />
                  {review.rating}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#647084]">{review.comment}</p>
              <p className="mt-2 text-xs font-medium text-[#8a94a6]">{review.customer_name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({
  inputMode,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  inputMode?: 'numeric';
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-2 block text-sm font-medium text-[#3d4656]">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-[#cbd5e1] bg-[#fbfcfe] px-3 text-sm outline-none transition placeholder:text-[#8d97a8] focus:border-[#1f7a68] focus:ring-4 focus:ring-[#1f7a68]/15"
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] p-3">
      <span className="block text-xs font-medium text-[#647084]">{label}</span>
      <span className="mt-1 block truncate text-sm font-semibold text-[#101828]">
        {value || 'Not set'}
      </span>
    </div>
  );
}

function ApplePayMotion() {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[#111827] bg-[#101828] p-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Apple Pay</p>
          <p className="mt-1 text-xs text-white/70">Apple payment selected</p>
        </div>
        <div className="relative flex h-14 w-28 items-center justify-center overflow-hidden rounded-md bg-white">
          <svg
            className="relative z-10 h-8 w-24"
            viewBox="0 0 120 40"
            role="img"
            aria-label="Apple Pay"
          >
            <path
              fill="#101828"
              d="M18.9 5.3c1.1-1.4 2.8-2.4 4.5-2.5.2 1.8-.5 3.5-1.6 4.8-1 1.3-2.7 2.4-4.4 2.2-.3-1.7.5-3.4 1.5-4.5Z"
            />
            <path
              fill="#101828"
              d="M26.3 21.1c0-3.5 2.8-5.2 3-5.3-1.6-2.4-4.1-2.7-5-2.8-2.1-.2-4.1 1.2-5.2 1.2-1.1 0-2.7-1.2-4.5-1.1-2.3 0-4.4 1.3-5.6 3.3-2.4 4.1-.6 10.2 1.7 13.5 1.1 1.6 2.5 3.4 4.2 3.3 1.7-.1 2.4-1.1 4.4-1.1s2.7 1.1 4.5 1.1c1.9 0 3.1-1.6 4.2-3.3 1.3-1.9 1.8-3.7 1.8-3.8-.1-.1-3.5-1.4-3.5-5Z"
            />
            <text
              x="39"
              y="27"
              fill="#101828"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="20"
              fontWeight="700"
            >
              Pay
            </text>
          </svg>
          <span className="absolute inset-y-0 -left-10 w-10 animate-[applepay-sweep_1.7s_ease-in-out_infinite] bg-[#d6e9ff]/70" />
        </div>
      </div>
      <style>{`
        @keyframes applepay-sweep {
          0% { transform: translateX(0); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateX(180px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function NoticeBox({ notice }: { notice: Notice }) {
  return (
    <div
      className={`mb-4 flex gap-3 rounded-md border px-4 py-3 text-sm ${
        notice.tone === 'success'
          ? 'border-[#b7dfce] bg-[#eefaf5] text-[#1c604f]'
          : 'border-[#efc0c3] bg-[#fff1f2] text-[#9b1c2c]'
      }`}
    >
      {notice.tone === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{notice.message}</span>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg border border-[#dce3ee] bg-white text-[#647084]">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#1f7a68]" />
      Loading store data
    </div>
  );
}

function MiniMetric({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#1f7a68]">
        {icon}
        {label}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-[#dce3ee] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#eef8f5] text-[#1f7a68]">
          {icon}
        </span>
        <span className="text-right text-2xl font-semibold text-[#101828]">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-[#647084]">{label}</p>
    </div>
  );
}
