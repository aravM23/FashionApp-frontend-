// Authentication JavaScript for StyleSync

let currentUser = null;
let isLoginMode = true;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const toggleAuthText = document.getElementById('toggleAuthText');
const authModalSubtitle = document.getElementById('authModalSubtitle');
const authError = document.getElementById('authError');
const userMenu = document.getElementById('userMenu');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Open login modal
  loginBtn.addEventListener('click', () => {
    openAuthModal();
  });

  // Close modal
  closeAuthModal.addEventListener('click', () => {
    closeModal();
  });

  // Close modal when clicking outside
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Toggle between login and signup
  toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      toggleAuthText.textContent = "Don't have an account?";
      toggleAuthMode.textContent = "Sign up";
      authModalSubtitle.textContent = "Sign in to your account";
    } else {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      toggleAuthText.textContent = "Already have an account?";
      toggleAuthMode.textContent = "Sign in";
      authModalSubtitle.textContent = "Create your account";
    }
    hideError();
  });

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await handleLogin(email, password);
  });

  // Signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    await handleSignup(name, email, password);
  });

  // User menu dropdown toggle
  userMenuBtn.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userDropdown.classList.add('hidden');
    }
  });

  // Logout button
  logoutBtn.addEventListener('click', async () => {
    await handleLogout();
  });
}

// Check if user is already logged in
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/user');
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      currentUser = data.user;
      updateUIForLoggedInUser(data.user);
    } else {
      updateUIForLoggedOutUser();
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    updateUIForLoggedOutUser();
  }
}

// Handle login
async function handleLogin(email, password) {
  hideError();
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      currentUser = data.user;
      updateUIForLoggedInUser(data.user);
      closeModal();
      showSuccessMessage('Welcome back! 🎉');
    } else {
      showError(data.error || 'Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Network error. Please try again.');
  }
}

// Handle signup
async function handleSignup(name, email, password) {
  hideError();

  if (password.length < 6) {
    showError('Password must be at least 6 characters long.');
    return;
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        full_name: name,
        email, 
        password 
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      currentUser = data.user;
      updateUIForLoggedInUser(data.user);
      closeModal();
      showSuccessMessage('Account created successfully! 🎉');
    } else {
      showError(data.error || 'Signup failed. Please try again.');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showError('Network error. Please try again.');
  }
}

// Handle logout
async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      currentUser = null;
      updateUIForLoggedOutUser();
      userDropdown.classList.add('hidden');
      showSuccessMessage('Logged out successfully! 👋');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
  // Hide login button, show user menu
  loginBtn.classList.add('hidden');
  userMenu.classList.remove('hidden');

  // Update user info in menu
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userInitial').textContent = user.name.charAt(0).toUpperCase();

  // Update closet greeting
  const closetUserName = document.getElementById('closetUserName');
  if (closetUserName) {
    closetUserName.textContent = user.name;
  }

  // Hide login overlays for protected sections
  const closetOverlay = document.getElementById('closetLoginOverlay');
  const styleProfileOverlay = document.getElementById('styleProfileLoginOverlay');
  if (closetOverlay) closetOverlay.classList.add('hidden');
  if (styleProfileOverlay) styleProfileOverlay.classList.add('hidden');
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  // Show login button, hide user menu
  loginBtn.classList.remove('hidden');
  userMenu.classList.add('hidden');

  // Reset closet greeting
  const closetUserName = document.getElementById('closetUserName');
  if (closetUserName) {
    closetUserName.textContent = 'Guest';
  }

  // Show login overlays for protected sections
  const closetOverlay = document.getElementById('closetLoginOverlay');
  const styleProfileOverlay = document.getElementById('styleProfileLoginOverlay');
  if (closetOverlay) closetOverlay.classList.remove('hidden');
  if (styleProfileOverlay) styleProfileOverlay.classList.remove('hidden');
}

// Modal functions
function openAuthModal() {
  authModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Reset to login mode
  isLoginMode = true;
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  toggleAuthText.textContent = "Don't have an account?";
  toggleAuthMode.textContent = "Sign up";
  authModalSubtitle.textContent = "Sign in to your account";
  hideError();
}

function closeModal() {
  authModal.classList.add('hidden');
  document.body.style.overflow = '';
  // Clear form fields
  loginForm.reset();
  signupForm.reset();
  hideError();
}

// Error handling
function showError(message) {
  const authErrorContainer = document.getElementById('authError');
  const authErrorText = document.getElementById('authErrorText');
  if (authErrorText) {
    authErrorText.textContent = message;
  } else {
    authErrorContainer.textContent = message;
  }
  authErrorContainer.classList.remove('hidden');
}

function hideError() {
  authError.classList.add('hidden');
  const authErrorText = document.getElementById('authErrorText');
  if (authErrorText) {
    authErrorText.textContent = '';
  }
}

// Success message (toast notification)
function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-24 right-6 z-[110] bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 translate-x-0';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Export current user for other scripts
window.getCurrentUser = () => currentUser;
