package com.f1champions.app.presentation.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.f1champions.app.R

private val DarkColorPalette = darkColors(
    primary = Color(0xFFFF1E00),
    primaryVariant = Color(0xFFBB0000),
    secondary = Color(0xFF03DAC5)
)

private val LightColorPalette = lightColors(
    primary = Color(0xFFFF1E00),
    primaryVariant = Color(0xFFBB0000),
    secondary = Color(0xFF03DAC5)
)

@Composable
fun F1ChampionsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) {
        DarkColorPalette
    } else {
        LightColorPalette
    }

    MaterialTheme(
        colors = colors,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
} 