<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'VOIC') }}: Autonomous AI Speaking & Interview Coach</title>
    
    <!-- SEO & Metadata -->
    <meta name="description" content="Platform pelatih komunikasi, sidang skripsi, dan wawancara kerja berbasis kecerdasan buatan dengan telemetri visual real-time dan analisis suara presisi.">

    <!-- Fonts: Geist & Geist Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Immediate Theme Initialization (Default Light, Prevent FOUC) -->
    <script>
        (function() {
            try {
                var storedTheme = localStorage.getItem('voic_theme');
                if (storedTheme === 'dark') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                }
            } catch (e) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
        })();
    </script>

    <!-- Scripts & Styles -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-slate-100 min-h-[100dvh] antialiased selection:bg-blue-600/20 selection:text-blue-950 transition-colors duration-200">
    @inertia
</body>
</html>
