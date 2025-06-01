package com.f1champions.app.presentation.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFFBA1A1A),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFFFDAD6),
    onPrimaryContainer = Color(0xFF410002),
    secondary = Color(0xFF775652),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFFFDAD6),
    onSecondaryContainer = Color(0xFF2C1512),
    tertiary = Color(0xFF735B2E),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFFFDFA6),
    onTertiaryContainer = Color(0xFF271900),
    error = Color(0xFFBA1A1A),
    errorContainer = Color(0xFFFFDAD6),
    onError = Color(0xFFFFFFFF),
    onErrorContainer = Color(0xFF410002),
    background = Color(0xFFFFFBFF),
    onBackground = Color(0xFF201A19),
    surface = Color(0xFFFFFBFF),
    onSurface = Color(0xFF201A19),
    surfaceVariant = Color(0xFFF5DDDA),
    onSurfaceVariant = Color(0xFF534341),
    outline = Color(0xFF857370),
    inverseOnSurface = Color(0xFFFBEEEC),
    inverseSurface = Color(0xFF362F2E),
    inversePrimary = Color(0xFFFFB4AB),
    surfaceTint = Color(0xFFBA1A1A),
    outlineVariant = Color(0xFFD8C2BE),
    scrim = Color(0xFF000000),
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFFFB4AB),
    onPrimary = Color(0xFF690005),
    primaryContainer = Color(0xFF93000A),
    onPrimaryContainer = Color(0xFFFFDAD6),
    secondary = Color(0xFFE7BDB7),
    onSecondary = Color(0xFF442926),
    secondaryContainer = Color(0xFF5D3F3B),
    onSecondaryContainer = Color(0xFFFFDAD6),
    tertiary = Color(0xFFE1C38C),
    onTertiary = Color(0xFF402D04),
    tertiaryContainer = Color(0xFF594419),
    onTertiaryContainer = Color(0xFFFFDFA6),
    error = Color(0xFFFFB4AB),
    errorContainer = Color(0xFF93000A),
    onError = Color(0xFF690005),
    onErrorContainer = Color(0xFFFFDAD6),
    background = Color(0xFF201A19),
    onBackground = Color(0xFFEDE0DE),
    surface = Color(0xFF201A19),
    onSurface = Color(0xFFEDE0DE),
    surfaceVariant = Color(0xFF534341),
    onSurfaceVariant = Color(0xFFD8C2BE),
    outline = Color(0xFFA08C89),
    inverseOnSurface = Color(0xFF201A19),
    inverseSurface = Color(0xFFEDE0DE),
    inversePrimary = Color(0xFFBA1A1A),
    surfaceTint = Color(0xFFFFB4AB),
    outlineVariant = Color(0xFF534341),
    scrim = Color(0xFF000000),
)

@Composable
fun F1ChampionsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        DarkColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
} 