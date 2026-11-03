import { useTheme } from '../contexts/ThemeContext';
import { Icon } from './Icon';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-pressed={theme === 'dark'}>
      <Icon name={theme === 'light' ? 'moon' : 'sun'} width="16" height="16" />
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  );
}
