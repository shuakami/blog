import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  mode: 'jit',
  theme: {
  	colors: {
  		transparent: 'transparent',
  		current: 'currentColor',
  		black: '#000',
  		white: '#fff',
  		gray: {
  			'100': 'hsl(0, 0%, 95%)',
  			'200': 'hsl(0, 0%, 92%)',
  			'300': 'hsl(0, 0%, 90%)',
  			'400': 'hsl(0, 0%, 92%)',
  			'500': 'hsl(0, 0%, 79%)',
  			'600': 'hsl(0, 0%, 66%)',
  			'700': 'hsl(0, 0%, 56%)',
  			'800': 'hsl(0, 0%, 49%)',
  			'900': 'hsl(0, 0%, 40%)',
  			'1000': 'hsl(0, 0%, 9%)'
  		},
  		blue: {
  			'100': 'hsl(212, 100%, 97%)',
  			'200': 'hsl(210, 100%, 96%)',
  			'300': 'hsl(210, 100%, 94%)',
  			'400': 'hsl(209, 100%, 90%)',
  			'500': 'hsl(209, 100%, 80%)',
  			'600': 'hsl(208, 100%, 66%)',
  			'700': 'hsl(212, 100%, 48%)',
  			'800': 'hsl(212, 100%, 41%)',
  			'900': 'hsl(211, 100%, 42%)',
  			'1000': 'hsl(211, 100%, 15%)'
  		},
  		amber: {
  			'100': 'hsl(39, 100%, 95%)',
  			'200': 'hsl(44, 100%, 92%)',
  			'300': 'hsl(43, 96%, 90%)',
  			'400': 'hsl(42, 100%, 78%)',
  			'500': 'hsl(38, 100%, 71%)',
  			'600': 'hsl(36, 90%, 62%)',
  			'700': 'hsl(39, 100%, 57%)',
  			'800': 'hsl(35, 100%, 52%)',
  			'900': 'hsl(30, 100%, 32%)',
  			'1000': 'hsl(20, 79%, 17%)'
  		},
  		red: {
  			'100': 'hsl(0, 100%, 97%)',
  			'200': 'hsl(0, 100%, 96%)',
  			'300': 'hsl(0, 100%, 95%)',
  			'400': 'hsl(0, 90%, 92%)',
  			'500': 'hsl(0, 82%, 85%)',
  			'600': 'hsl(359, 90%, 71%)',
  			'700': 'hsl(358, 75%, 59%)',
  			'800': 'hsl(358, 70%, 52%)',
  			'900': 'hsl(358, 66%, 48%)',
  			'1000': 'hsl(355, 49%, 15%)'
  		},
  		green: {
  			'100': 'hsl(120, 60%, 96%)',
  			'200': 'hsl(120, 60%, 95%)',
  			'300': 'hsl(120, 60%, 91%)',
  			'400': 'hsl(122, 60%, 86%)',
  			'500': 'hsl(124, 60%, 75%)',
  			'600': 'hsl(125, 60%, 64%)',
  			'700': 'hsl(131, 41%, 46%)',
  			'800': 'hsl(132, 43%, 39%)',
  			'900': 'hsl(133, 50%, 32%)',
  			'1000': 'hsl(128, 29%, 15%)'
  		},
  		teal: {
  			'100': 'hsl(169, 70%, 96%)',
  			'200': 'hsl(167, 70%, 94%)',
  			'300': 'hsl(168, 70%, 90%)',
  			'400': 'hsl(170, 70%, 85%)',
  			'500': 'hsl(170, 70%, 72%)',
  			'600': 'hsl(170, 70%, 57%)',
  			'700': 'hsl(173, 80%, 36%)',
  			'800': 'hsl(173, 83%, 30%)',
  			'900': 'hsl(174, 91%, 25%)',
  			'1000': 'hsl(171, 80%, 13%)'
  		},
  		purple: {
  			'100': 'hsl(276, 100%, 97%)',
  			'200': 'hsl(277, 87%, 97%)',
  			'300': 'hsl(274, 78%, 95%)',
  			'400': 'hsl(276, 71%, 92%)',
  			'500': 'hsl(274, 70%, 82%)',
  			'600': 'hsl(273, 72%, 73%)',
  			'700': 'hsl(272, 51%, 54%)',
  			'800': 'hsl(272, 47%, 45%)',
  			'900': 'hsl(274, 71%, 43%)',
  			'1000': 'hsl(276, 100%, 15%)'
  		},
  		neutral: {
  			'50': 'hsl(210, 20%, 96%)',
  			'100': 'hsl(210, 20%, 96%)',
  			'200': 'hsl(210, 15%, 90%)',
  			'300': 'hsl(210, 10%, 80%)',
  			'400': 'hsl(210, 5%, 70%)',
  			'500': 'hsl(210, 0%, 60%)',
  			'600': 'hsl(210, 0%, 50%)',
  			'700': 'hsl(210, 0%, 40%)',
  			'800': 'hsl(210, 0%, 30%)',
  			'900': 'hsl(210, 0%, 20%)',
  			'1000': 'hsl(210, 0%, 10%)'
  		},
  		sky: {
  			'100': 'hsl(197, 100%, 96%)',
  			'200': 'hsl(197, 100%, 90%)',
  			'300': 'hsl(197, 100%, 80%)',
  			'400': 'hsl(197, 100%, 70%)',
  			'500': 'hsl(197, 100%, 60%)',
  			'600': 'hsl(197, 100%, 50%)',
  			'700': 'hsl(197, 100%, 40%)',
  			'800': 'hsl(197, 100%, 30%)',
  			'900': 'hsl(197, 100%, 20%)',
  			'1000': 'hsl(197, 100%, 10%)'
  		},
  		pink: {
  			'100': 'hsl(330, 100%, 96%)',
  			'200': 'hsl(340, 90%, 96%)',
  			'300': 'hsl(340, 82%, 94%)',
  			'400': 'hsl(341, 76%, 91%)',
  			'500': 'hsl(340, 75%, 84%)',
  			'600': 'hsl(341, 75%, 73%)',
  			'700': 'hsl(336, 80%, 58%)',
  			'800': 'hsl(336, 74%, 51%)',
  			'900': 'hsl(336, 65%, 45%)',
  			'1000': 'hsl(333, 74%, 15%)'
  		},
  		success: {
  			lighter: '#d3e5ff',
  			light: '#3291ff',
  			DEFAULT: '#0070f3',
  			dark: '#0761d1'
  		},
  		error: {
  			lighter: '#f7d4d6',
  			light: '#ff1a1a',
  			DEFAULT: '#ee0000',
  			dark: '#c50000'
  		},
  		warning: {
  			lighter: '#ffefcf',
  			light: '#f7b955',
  			DEFAULT: '#f5a623',
  			dark: '#ab570a'
  		},
  		background: 'var(--background)',
  		foreground: 'var(--foreground)',
  		accent: {
  			'1': '#fafafa',
  			'2': '#eaeaea',
  			'3': '#999999',
  			'4': '#888888',
  			'5': '#666666',
  			'6': '#444444',
  			'7': '#333333',
  			'8': '#111111'
  		},
  		highlight: {
  			purple: '#f81ce5',
  			magenta: '#eb367f',
  			pink: '#ff0080',
  			yellow: '#fff500'
  		},
  		gradient: {
  			'develop-start': '#007cf0',
  			'develop-end': '#00dfd8',
  			'preview-start': '#7928ca',
  			'preview-end': '#ff0080',
  			'ship-start': '#ff4d4d',
  			'ship-end': '#f9cb28'
  		}
  	},
  	extend: {
  		boxShadow: {
  			smallest: '0px 2px 4px rgba(0,0,0,0.1)',
  			'extra-small': '0px 4px 8px rgba(0,0,0,0.12)',
  			small: '0 5px 10px rgba(0,0,0,0.12)',
  			medium: '0 8px 30px rgba(0,0,0,0.12)',
  			large: '0 30px 60px rgba(0,0,0,0.12)',
  			hover: '0 30px 60px rgba(0,0,0,0.12)',
  			sticky: '0 12px 10px -10px rgba(0,0,0,0.12)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
  				'var(--font-noto-sans-sc)',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			mono: [
  				'var(--font-geist-mono)',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		textColor: {
  			develop: '#0a72ef',
  			preview: '#de1d8d',
  			ship: '#ff5b4f'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: 'class',
} satisfies Config;