// Email Notification Service using EmailJS
// For production, you'll need to set up EmailJS account and configure template

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

let emailjsLoaded = false;

async function loadEmailJS(): Promise<void> {
  if (emailjsLoaded) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      emailjsLoaded = true;
      // @ts-ignore
      if (window.emailjs) {
        // @ts-ignore
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS'));
    document.head.appendChild(script);
  });
}

export interface DailyPlanEmailData {
  date: string;
  habits: Array<{ name: string; targetCount: number; unit: string; completed: number }>;
  tasks: Array<{ title: string; durationMinutes: number; category: string; completed: boolean }>;
  totalStudyHours: number;
}

export async function sendDailyPlanEmail(
  emailAddress: string,
  planData: DailyPlanEmailData
): Promise<boolean> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS not configured');
    return false;
  }

  try {
    await loadEmailJS();

    const templateParams = {
      to_email: emailAddress,
      date: planData.date,
      habits: planData.habits.map(h => `${h.name}: ${h.completed}/${h.targetCount} ${h.unit}`).join('\n'),
      tasks: planData.tasks.map(t => `${t.title} (${t.durationMinutes}min) - ${t.category} ${t.completed ? '✓' : '○'}`).join('\n'),
      total_study_hours: planData.totalStudyHours.toFixed(1),
      dashboard_url: window.location.origin,
    };

    // @ts-ignore
    const response = await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendTestEmail(emailAddress: string): Promise<boolean> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS not configured');
    return false;
  }

  try {
    await loadEmailJS();

    const templateParams = {
      to_email: emailAddress,
      date: new Date().toLocaleDateString(),
      habits: 'This is a test email from Habit Tracker',
      tasks: 'If you received this, email notifications are working!',
      total_study_hours: '0',
      dashboard_url: window.location.origin,
    };

    // @ts-ignore
    const response = await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return response.status === 200;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}

export function isEmailConfigured(): boolean {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}