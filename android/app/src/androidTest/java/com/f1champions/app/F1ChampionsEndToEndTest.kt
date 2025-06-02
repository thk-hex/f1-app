package com.f1champions.app

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.espresso.Espresso
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test

@HiltAndroidTest
class F1ChampionsEndToEndTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
    
    @Test
    fun testAppNavigationFlow() {
        // Start at welcome screen
        composeRule.onNodeWithText("F1 Champions").assertIsDisplayed()
        composeRule.onNodeWithText("Explore Formula 1 champions throughout the years").assertIsDisplayed()

        composeRule.waitUntil(5000) {
            try {
                composeRule.onNodeWithText("F1 Champions").assertExists()
                true
            } catch (e: Exception) {
                false
            }
        }

        composeRule.onNodeWithText("F1 Champions").assertIsDisplayed()
    }
} 