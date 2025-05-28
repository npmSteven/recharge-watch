import puppeteer from 'puppeteer';
import axios from 'axios';
import config from './config.js';

let alreadyLaunched = false;

const cache: { session?: string, dev_url?: string, cookieStr?: string } = {};

const launchResponse: {
  page?: puppeteer.Page,
  browser?: puppeteer.Browser,
} = {};

async function launch(): Promise<void> {
  try {
    if (alreadyLaunched) return;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    launchResponse.browser = browser;
    launchResponse.page = page;
    alreadyLaunched = true;
  } catch (error) {
    console.error('ERROR - launch():', error);
    throw error;
  }
}

export async function login(): Promise<void> {
  try {
    await launch();
    const { page, browser } = launchResponse;
    if (!page || !browser) throw new Error('We was unable to launch the browser');
    console.log('Visiting store');
    await page.goto('https://admin.rechargeapps.com/admin/login');
    await page.type('[name="email"]', config.email);
    await page.type('[name="password"]', config.password);
    console.log('Typed email and password');
    await page.click('[type="submit"]:not([disabled="disabled"])');
    await page.waitForSelector('[class="select-store"]');
  } catch (error) {
    console.error('ERROR - login():', error);
    throw error;
  }
}

export async function getCookieStr(): Promise<string> {
  try {
    if (cache?.cookieStr) return cache.cookieStr;
    const { page, browser } = launchResponse;
    if (!page || !browser) throw new Error('We was unable to launch the browser');
    const cookies = await browser.cookies();
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    cache.cookieStr = cookieStr;
    return cookieStr;
  } catch (error) {
    console.error('ERROR - getCookieStr():', error);
    throw error;
  }
}

export async function getSession(): Promise<string> {
  try {
    if (cache?.session) return cache.session;
    const { page, browser } = launchResponse;
    if (!page || !browser) throw new Error('We was unable to launch the browser');
    const cookies = await browser.cookies();
    const session = cookies.find(c => c.name === 'session');
    if (!session) throw new Error('Unable to find session in cookies');
    cache.session = session.value;
    return session.value;
  } catch (error) {
    console.error('ERROR - getSession():', error);
    throw error;
  }
}

export async function getDevelopmentUrl(): Promise<string> {
  try {
    if (cache?.dev_url) return cache.dev_url;
    const cookieStr = await getCookieStr();
    console.log('dev_url', `${config.store}/admin_merchant/api/customers/${config.customer_id}/customer_portal_access?page_destination=subscriptions`);
    console.log('store', config.store);
    console.log('customer id', config.customer_id);
    const response = await axios.get(`${config.store}/admin_merchant/api/customers/${config.customer_id}/customer_portal_access?page_destination=subscriptions`, {
      headers: {
        Cookie: cookieStr,
      }
    });
    const devUrl = `${response.data.portal_url}&preview_theme=${config.theme_id}`;
    cache.dev_url = devUrl;
    return devUrl;
  } catch (error) {
    console.error('ERROR - getDevelopmentUrl():', error);
    throw error;
  }
}

