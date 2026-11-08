const checkIcon = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

document.addEventListener('DOMContentLoaded', function() {
  updateDateFormatDescription();
  updateCurrentDate();

  document.getElementById('dateFormatSelect').addEventListener('change', function() {
    updateDateFormatDescription();
    updatePlaceholders();
    updateCurrentDate();
    document.getElementById('daysGregorianResult').value = '';
    updateDaysBetweenState();
  });

  document.getElementById('gregorianDate').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      convertGregorianToJulian();
    }
  });

  document.getElementById('julianDate').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      convertJulianToGregorian();
    }
  });

  document.getElementById('gregorianDate').addEventListener('input', function(e) {
    formatGregorianInput(e.target);
  });

  ['daysGregorianFrom', 'daysGregorianTo'].forEach(function(id) {
    const input = document.getElementById(id);
    input.addEventListener('input', function(e) {
      formatGregorianInput(e.target);
      document.getElementById('daysGregorianResult').value = '';
      updateDaysBetweenState();
    });
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !document.getElementById('daysGregorianBtn').disabled) {
        calculateGregorianDaysBetween();
      }
    });
  });

  ['daysJulianFrom', 'daysJulianTo'].forEach(function(id) {
    const input = document.getElementById(id);
    input.addEventListener('input', function(e) {
      formatJulianInput(e.target);
      document.getElementById('daysJulianResult').value = '';
      updateDaysBetweenState();
    });
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !document.getElementById('daysJulianBtn').disabled) {
        calculateJulianDaysBetween();
      }
    });
  });

  updatePlaceholders();
  updateDaysBetweenState();
});

function updateDateFormatDescription() {
  const formatSelect = document.getElementById('dateFormatSelect');
  const descriptionDiv = document.getElementById('dateFormatDescription');

  if (formatSelect.value === 'mm/dd/yyyy') {
    descriptionDiv.innerHTML = '<strong>US Format (MM/DD/YYYY)</strong>';
  } else {
    descriptionDiv.innerHTML = '<strong>International Format (DD/MM/YYYY)</strong>';
  }
}

function updatePlaceholders() {
  const formatSelect = document.getElementById('dateFormatSelect');
  const gregorianInput = document.getElementById('gregorianDate');
  const daysPlaceholder = formatSelect.value === 'mm/dd/yyyy' ? 'mm/dd/yyyy' : 'dd/mm/yyyy';

  gregorianInput.placeholder = '  /  /    ';
  document.getElementById('daysGregorianFrom').placeholder = daysPlaceholder;
  document.getElementById('daysGregorianTo').placeholder = daysPlaceholder;
}

function formatGregorianInput(input) {
  let value = input.value.replace(/\D/g, '');
  let formattedValue = '';

  if (value.length > 0) {
    formattedValue = value.substring(0, 2);
    if (value.length > 2) {
      formattedValue += '/' + value.substring(2, 4);
    }
    if (value.length > 4) {
      formattedValue += '/' + value.substring(4, 8);
    }
  }

  input.value = formattedValue;
}

function formatJulianInput(input) {
  input.value = input.value.replace(/\D/g, '').substring(0, 6);
}

function parseStrictGregorianDate(dateStr, format) {
  const date = parseGregorianDate(dateStr, format);
  if (!date || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  if (formatGregorianDate(date, format) !== dateStr) {
    throw new Error('Invalid date');
  }
  return date;
}

function parseValidJdeJulian(value) {
  const trimmed = String(value).trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error('Invalid JDE Julian date');
  }
  const julianDate = parseInt(trimmed, 10);
  if (julianDate < 1001 || julianDate > 199365) {
    throw new Error('JDE Julian date must be between 1001 and 199365');
  }
  const date = jdeJulianToGregorian(julianDate);
  if (gregorianToJDEJulian(date) !== julianDate) {
    throw new Error('Invalid JDE Julian date');
  }
  return date;
}

function daysBetweenDates(dateA, dateB) {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.abs(Math.round((b - a) / oneDay));
}

function setRowError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

function gregorianFieldError(value, format) {
  if (!value || value.length < 10) {
    return '';
  }
  try {
    parseStrictGregorianDate(value, format);
    return '';
  } catch (error) {
    return 'Enter a real date between 1901 and 2099.';
  }
}

function julianFieldError(value) {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed) || trimmed.length < 4) {
    return '';
  }
  const julianDate = parseInt(trimmed, 10);
  if (julianDate > 199365 || (trimmed.length === 6 && julianDate < 1001)) {
    return 'Enter a real JDE Julian date between 1001 and 199365.';
  }
  if (trimmed.length < 6 && julianDate < 1001) {
    return '';
  }
  try {
    parseValidJdeJulian(trimmed);
    return '';
  } catch (error) {
    if (trimmed.length < 6) {
      return '';
    }
    return 'Enter a real JDE Julian date between 1001 and 199365.';
  }
}

function updateDaysBetweenState() {
  const format = document.getElementById('dateFormatSelect').value;
  const gregorianFrom = document.getElementById('daysGregorianFrom').value.trim();
  const gregorianTo = document.getElementById('daysGregorianTo').value.trim();
  let gregorianValid = false;
  try {
    parseStrictGregorianDate(gregorianFrom, format);
    parseStrictGregorianDate(gregorianTo, format);
    gregorianValid = true;
  } catch (error) {
    gregorianValid = false;
  }
  document.getElementById('daysGregorianBtn').disabled = !gregorianValid;
  setRowError('daysGregorianError', gregorianFieldError(gregorianFrom, format) || gregorianFieldError(gregorianTo, format));

  const julianFrom = document.getElementById('daysJulianFrom').value.trim();
  const julianTo = document.getElementById('daysJulianTo').value.trim();
  let julianValid = false;
  try {
    parseValidJdeJulian(julianFrom);
    parseValidJdeJulian(julianTo);
    julianValid = true;
  } catch (error) {
    julianValid = false;
  }
  document.getElementById('daysJulianBtn').disabled = !julianValid;
  setRowError('daysJulianError', julianFieldError(julianFrom) || julianFieldError(julianTo));
}

function calculateGregorianDaysBetween() {
  const format = document.getElementById('dateFormatSelect').value;
  const result = document.getElementById('daysGregorianResult');
  try {
    const from = parseStrictGregorianDate(document.getElementById('daysGregorianFrom').value.trim(), format);
    const to = parseStrictGregorianDate(document.getElementById('daysGregorianTo').value.trim(), format);
    result.value = String(daysBetweenDates(from, to));
    setRowError('daysGregorianError', '');
  } catch (error) {
    result.value = '';
    setRowError('daysGregorianError', 'Enter a real date between 1901 and 2099.');
  }
}

function calculateJulianDaysBetween() {
  const result = document.getElementById('daysJulianResult');
  try {
    const from = parseValidJdeJulian(document.getElementById('daysJulianFrom').value.trim());
    const to = parseValidJdeJulian(document.getElementById('daysJulianTo').value.trim());
    result.value = String(daysBetweenDates(from, to));
    setRowError('daysJulianError', '');
  } catch (error) {
    result.value = '';
    setRowError('daysJulianError', 'Enter a real JDE Julian date between 1001 and 199365.');
  }
}

function convertGregorianToJulian() {
  const gregorianInput = document.getElementById('gregorianDate');
  const julianResult = document.getElementById('julianResult');
  const formatSelect = document.getElementById('dateFormatSelect');

  const dateStr = gregorianInput.value.trim();
  if (!dateStr) {
    showError('Please enter a Gregorian date');
    return;
  }

  try {
    const date = parseGregorianDate(dateStr, formatSelect.value);
    if (!date || isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    const julianDate = gregorianToJDEJulian(date);
    julianResult.value = julianDate;
    clearError();
  } catch (error) {
    showError('Invalid date format. Please check your input.');
    julianResult.value = '';
  }
}

function convertJulianToGregorian() {
  const julianInput = document.getElementById('julianDate');
  const gregorianResult = document.getElementById('gregorianResult');

  const julianStr = julianInput.value.trim();
  if (!julianStr) {
    showError('Please enter a JDE Julian date');
    return;
  }

  try {
    const julianDate = parseInt(julianStr);
    if (isNaN(julianDate) || julianDate < 1001 || julianDate > 199365) {
      throw new Error('JDE Julian date must be between 1001 and 199365');
    }

    const gregorianDate = jdeJulianToGregorian(julianDate);
    const formatSelect = document.getElementById('dateFormatSelect');
    const formattedDate = formatGregorianDate(gregorianDate, formatSelect.value);

    gregorianResult.value = formattedDate;
    clearError();
  } catch (error) {
    showError('Invalid JDE Julian date. Must be between 1001 and 199365.');
    gregorianResult.value = '';
  }
}

function parseGregorianDate(dateStr, format) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid date format');
  }

  let day, month, year;
  if (format === 'mm/dd/yyyy') {
    month = parseInt(parts[0]);
    day = parseInt(parts[1]);
    year = parseInt(parts[2]);
  } else {
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);
  }

  if (month < 1 || month > 12) {
    throw new Error('Invalid month');
  }
  if (day < 1 || day > 31) {
    throw new Error('Invalid day');
  }
  if (year < 1901 || year > 2099) {
    throw new Error('Year must be between 1901 and 2099');
  }

  return new Date(year, month - 1, day);
}

function formatGregorianDate(date, format) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (format === 'mm/dd/yyyy') {
    return `${month}/${day}/${year}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

function gregorianToJDEJulian(date) {
  const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = calendarDate.getFullYear();
  const century = Math.floor(year / 100) - 19;
  const yearWithinCentury = year % 100;

  const startOfYear = new Date(year, 0, 0);
  const diff = calendarDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.round(diff / oneDay);

  return parseInt(`${century}${yearWithinCentury.toString().padStart(2, '0')}${dayOfYear.toString().padStart(3, '0')}`);
}

function jdeJulianToGregorian(julianDate) {
  const julianStr = julianDate.toString().padStart(6, '0');
  const century = parseInt(julianStr.charAt(0)) + 19;
  const year = parseInt(julianStr.substr(1, 2));
  const dayOfYear = parseInt(julianStr.substr(3, 3));

  const fullYear = century * 100 + year;
  const date = new Date(fullYear, 0, dayOfYear);

  return date;
}

function showError(message) {
  const errorDiv = document.getElementById('pageError');
  errorDiv.hidden = false;
  errorDiv.textContent = message;
}

function clearError() {
  const errorDiv = document.getElementById('pageError');
  errorDiv.hidden = true;
  errorDiv.textContent = '';
}

function updateCurrentDate() {
  const now = new Date();
  const formatSelect = document.getElementById('dateFormatSelect');
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  const currentJulianDisplay = document.getElementById('currentJulianDisplay');

  currentDateDisplay.textContent = formatGregorianDate(now, formatSelect.value);
  currentJulianDisplay.textContent = gregorianToJDEJulian(now);
}

function copyCurrentJulianToClipboard(button) {
  const julianValue = document.getElementById('currentJulianDisplay').textContent;
  if (!julianValue) {
    return;
  }

  const originalHtml = button.innerHTML;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(julianValue).then(() => {
      showCopied(button, originalHtml);
    }).catch(function() {
      fallbackCopyJulian(julianValue, button, originalHtml);
    });
  } else {
    fallbackCopyJulian(julianValue, button, originalHtml);
  }
}

function showCopied(button, originalHtml) {
  button.innerHTML = checkIcon;
  button.classList.add('copied');
  setTimeout(() => {
    button.innerHTML = originalHtml;
    button.classList.remove('copied');
  }, 2000);
}

function fallbackCopyJulian(text, button, originalHtml) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopied(button, originalHtml);
    } else {
      alert('Failed to copy to clipboard');
    }
  } catch (err) {
    alert('Failed to copy to clipboard');
  } finally {
    document.body.removeChild(textArea);
  }
}
