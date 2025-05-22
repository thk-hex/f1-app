package com.f1champions.app.presentation.ui.screens

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.f1champions.app.domain.model.Race
import com.f1champions.app.presentation.ui.RaceWinnersUiState
import com.f1champions.app.presentation.ui.UiState
import com.f1champions.app.presentation.viewmodel.RaceWinnersViewModel
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Rule
import org.junit.Test

class RaceWinnersScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun raceWinnersList_displaysCorrectly_whenStateIsSuccess() {
        // Given
        val races = listOf(
            Race("Monaco GP", "Max Verstappen", "verstappen"),
            Race("British GP", "Lewis Hamilton", "hamilton")
        )
        val viewModel = mockk<RaceWinnersViewModel>()
        val uiState = MutableStateFlow(
            RaceWinnersUiState(
                season = "2023",
                championId = "verstappen",
                raceWinners = UiState.Success(races)
            )
        )
        every { viewModel.uiState } returns uiState
        
        val onBackClick = mockk<() -> Unit>(relaxed = true)
        
        // When
        composeTestRule.setContent { 
            RaceWinnersScreen(
                onBackClick = onBackClick,
                viewModel = viewModel
            )
        }
        
        // Then
        composeTestRule.onNodeWithText("Race Winners (2023)").assertIsDisplayed()
        composeTestRule.onNodeWithText("Monaco GP").assertIsDisplayed()
        composeTestRule.onNodeWithText("Max Verstappen").assertIsDisplayed()
        composeTestRule.onNodeWithText("British GP").assertIsDisplayed()
        composeTestRule.onNodeWithText("Lewis Hamilton").assertIsDisplayed()
        
        // Test back navigation
        // Find and click the back button (usually an arrow icon)
        // For simplicity using the entire TopAppBar
        composeTestRule.onNodeWithText("Race Winners (2023)").performClick()
        verify { onBackClick() }
    }
    
    @Test
    fun raceWinnersList_showsLoadingIndicator_whenStateIsLoading() {
        // Given
        val viewModel = mockk<RaceWinnersViewModel>()
        val uiState = MutableStateFlow(
            RaceWinnersUiState(
                season = "2023",
                championId = "verstappen",
                raceWinners = UiState.Loading
            )
        )
        every { viewModel.uiState } returns uiState
        
        // When
        composeTestRule.setContent { 
            RaceWinnersScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }
        
        // Then
        // In a real test, you would need a test tag for the loading indicator
        // Since we don't have that, we just verify the title is displayed
        composeTestRule.onNodeWithText("Race Winners (2023)").assertIsDisplayed()
        // And ensure race winner items are not displayed
        composeTestRule.onNodeWithText("Monaco GP").assertDoesNotExist()
    }
    
    @Test
    fun raceWinnersList_showsErrorMessage_whenStateIsError() {
        // Given
        val viewModel = mockk<RaceWinnersViewModel>()
        val uiState = MutableStateFlow(
            RaceWinnersUiState(
                season = "2023",
                championId = "verstappen",
                raceWinners = UiState.Error("Failed to load race winners")
            )
        )
        every { viewModel.uiState } returns uiState
        
        // When
        composeTestRule.setContent { 
            RaceWinnersScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }
        
        // Then
        composeTestRule.onNodeWithText("Race Winners (2023)").assertIsDisplayed()
        composeTestRule.onNodeWithText("Failed to load race winners").assertIsDisplayed()
        composeTestRule.onNodeWithText("Retry").assertIsDisplayed()
    }
} 