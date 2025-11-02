// src/components/Common/ThemeIcons.jsx

export const SunIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 1 0-1.06-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.06l1.59-.1.001-1.59Zm-15.717 0a.75.75 0 0 0 1.061-1.06l1.59-1.59a.75.75 0 0 0-1.06-1.06l-1.59 1.59Zm18.75 5.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1 0-1.5h2.25ZM.75 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H1.5a.75.75 0 0 1-.75-.75Zm1.874 5.929a.75.75 0 1 0 1.06 1.06l1.59-.1.001-1.59a.75.75 0 0 0-1.06-1.06l-1.59 1.59Zm12.72-3.72a.75.75 0 1 0-1.061 1.06l1.591 1.59a.75.75 0 0 0 1.06-1.06l-1.59-1.59ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

export const MoonIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9.52 2.47a.75.75 0 0 1 .5.766 8.25 8.25 0 0 0 7.433 12.841.75.75 0 0 1 1.026.837 9.75 9.75 0 1 1-14.858-7.794.75.75 0 0 1 .904-.372ZM12.75 6a.75.75 0 0 0-.75-.75H7.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" />
  </svg>
);

export const EyeIcon = ({ showPassword, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {showPassword ? (
      // When password is SHOWN (text), display the 'Hide' icon (closed eye/obscured)
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 011.05 9M17.5 13.5a5.5 5.5 0 10-11 0 5.5 5.5 0 0011 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11z" />
      </>
    ) : (
      // When password is HIDDEN (password type), display the 'Show' icon (open eye/clear)
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
);

export const PotholeIcon = ({ className = 'w-10 h-10' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const BinIcon = ({ className = 'w-10 h-10' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Keep other icons if needed, but the provided code only uses the above.