package com.f1champions.app.presentation.ui.screens

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.performClick
import com.f1champions.app.domain.model.Season
import com.f1champions.app.presentation.ui.ChampionsUiState
import com.f1champions.app.presentation.ui.UiState
import com.f1champions.app.presentation.ui.theme.F1ChampionsTheme
import com.f1champions.app.presentation.viewmodel.ChampionsViewModel
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Rule
import org.junit.Test

class ChampionsScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun championsList_displaysCorrectly_whenStateIsSuccess() {
        // Given
        val seasons = listOf(
            Season("2023", "Max Verstappen", "verstappen"),
            Season("2022", "Max Verstappen", "verstappen")
        )
        val viewModel = mockk<ChampionsViewModel>()
        val uiState = MutableStateFlow(
            ChampionsUiState(
                UiState.Success(seasons)
            )
        )
        every { viewModel.uiState } returns uiState
        
        val onSeasonClick = mockk<(String, String) -> Unit>(relaxed = true)
        
        // When
        composeTestRule.setContent { 
            F1ChampionsTheme {
                ChampionsScreen(
                    onSeasonClick = onSeasonClick,
                    viewModel = viewModel
                )
            }
        }
        
        // Then
        composeTestRule.onNodeWithText("2023").assertIsDisplayed()
        // Verify Max Verstappen appears in the list at least once
        composeTestRule.onAllNodesWithText("Max Verstappen")[0].assertIsDisplayed()
        composeTestRule.onNodeWithText("2022").assertIsDisplayed()
        
        // Test click handling
        composeTestRule.onNodeWithText("2023").performClick()
        verify { onSeasonClick("2023", "verstappen") }
    }
    
    @Test
    fun championsList_showsErrorMessage_whenStateIsError() {
        // Given
        val viewModel = mockk<ChampionsViewModel>()
        val uiState = MutableStateFlow(
            ChampionsUiState(
                UiState.Error("Failed to load champions")
            )
        )
        every { viewModel.uiState } returns uiState
        
        // When
        composeTestRule.setContent { 
            F1ChampionsTheme {
                ChampionsScreen(
                    onSeasonClick = { _, _ -> },
                    viewModel = viewModel
                )
            }
        }
        
        // Then
        composeTestRule.onNodeWithText("Failed to load champions").assertIsDisplayed()
        composeTestRule.onNodeWithText("Retry").assertIsDisplayed()
    }
} 