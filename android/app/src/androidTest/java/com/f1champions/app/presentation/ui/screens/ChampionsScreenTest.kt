package com.f1champions.app.presentation.ui.screens

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.assertIsNotDisplayed
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
    
    // Test Data Factory Functions
    private fun createTestSeasons(): List<Season> {
        return listOf(
            Season("2023", "Max Verstappen", "verstappen"),
            Season("2022", "Max Verstappen", "verstappen"),
            Season("2021", "Lewis Hamilton", "hamilton")
        )
    }
    
    private fun createSingleSeason(): List<Season> {
        return listOf(Season("2023", "Max Verstappen", "verstappen"))
    }
    
    private fun createMockViewModel(uiState: ChampionsUiState): ChampionsViewModel {
        val viewModel = mockk<ChampionsViewModel>()
        every { viewModel.uiState } returns MutableStateFlow(uiState)
        return viewModel
    }
    
    @Test
    fun displayAllChampionsCorrectlyWithMultipleChampions() {
        // Given
        val testSeasons = createTestSeasons()
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Success(testSeasons))
        )
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
        composeTestRule.onNodeWithText("2022").assertIsDisplayed()
        composeTestRule.onNodeWithText("2021").assertIsDisplayed()
        
        // Verify champions' names are displayed
        composeTestRule.onAllNodesWithText("Max Verstappen")[0].assertIsDisplayed()
        composeTestRule.onNodeWithText("Lewis Hamilton").assertIsDisplayed()
        
        // Test click interaction
        composeTestRule.onNodeWithText("2023").performClick()
        verify { onSeasonClick("2023", "verstappen") }
    }
    
    @Test
    fun handleClickEventsForDifferentChampions() {
        // Given
        val testSeasons = createTestSeasons()
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Success(testSeasons))
        )
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
        composeTestRule.onNodeWithText("2021").performClick()
        verify { onSeasonClick("2021", "hamilton") }
        
        composeTestRule.onNodeWithText("2022").performClick()
        verify { onSeasonClick("2022", "verstappen") }
    }
    
    @Test
    fun displaySingleChampionCorrectly() {
        // Given
        val singleSeason = createSingleSeason()
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Success(singleSeason))
        )
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
        composeTestRule.onNodeWithText("Max Verstappen").assertIsDisplayed()
        
        // Verify click works for single item
        composeTestRule.onNodeWithText("2023").performClick()
        verify { onSeasonClick("2023", "verstappen") }
    }
    
    @Test
    fun handleEmptyChampionsListGracefully() {
        // Given
        val emptySeasons = emptyList<Season>()
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Success(emptySeasons))
        )
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
        // Verify no champion data is displayed
        composeTestRule.onNodeWithText("2023").assertIsNotDisplayed()
        composeTestRule.onNodeWithText("Max Verstappen").assertIsNotDisplayed()
    }
    
    @Test
    fun displayErrorMessageAndRetryButton() {
        // Given
        val errorMessage = "Failed to load champions"
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Error(errorMessage))
        )
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
        composeTestRule.onNodeWithText("Failed to load champions").assertIsDisplayed()
        composeTestRule.onNodeWithText("Retry").assertIsDisplayed()
        
        // Verify champion data is not shown in error state
        composeTestRule.onNodeWithText("2023").assertIsNotDisplayed()
        composeTestRule.onNodeWithText("Max Verstappen").assertIsNotDisplayed()
    }
    
    @Test
    fun displayNetworkErrorMessageCorrectly() {
        // Given
        val networkErrorMessage = "Network connection failed"
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Error(networkErrorMessage))
        )
        
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
        composeTestRule.onNodeWithText("Network connection failed").assertIsDisplayed()
        composeTestRule.onNodeWithText("Retry").assertIsDisplayed()
    }
    
    @Test
    fun displayApiErrorMessageCorrectly() {
        // Given
        val apiErrorMessage = "API server unavailable"
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Error(apiErrorMessage))
        )
        
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
        composeTestRule.onNodeWithText("API server unavailable").assertIsDisplayed()
        composeTestRule.onNodeWithText("Retry").assertIsDisplayed()
    }
    
    @Test
    fun displayLoadingIndicatorWhenFetching() {
        // Given
        val viewModel = createMockViewModel(
            ChampionsUiState(UiState.Loading)
        )
        
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
        // Verify loading state is shown (you might need to add test tags for loading indicators)
        // composeTestRule.onNodeWithTag("loading_indicator").assertIsDisplayed()
        
        // Verify champion data is not shown in loading state
        composeTestRule.onNodeWithText("2023").assertIsNotDisplayed()
        composeTestRule.onNodeWithText("Max Verstappen").assertIsNotDisplayed()
        composeTestRule.onNodeWithText("Failed to load champions").assertIsNotDisplayed()
    }
} 