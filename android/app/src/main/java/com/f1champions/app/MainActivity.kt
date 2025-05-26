package com.f1champions.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.f1champions.app.presentation.ui.screens.ChampionsScreen
import com.f1champions.app.presentation.ui.screens.RaceWinnersScreen
import com.f1champions.app.presentation.ui.screens.WelcomeScreen
import com.f1champions.app.presentation.ui.theme.F1ChampionsTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            F1ChampionsTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    
                    NavHost(
                        navController = navController,
                        startDestination = "welcome"
                    ) {
                        composable("welcome") {
                            WelcomeScreen(
                                onNavigateToChampions = {
                                    navController.navigate("champions") {
                                        popUpTo("welcome") { inclusive = true }
                                    }
                                }
                            )
                        }
                        
                        composable("champions") {
                            ChampionsScreen(
                                onSeasonClick = { season, championId ->
                                    navController.navigate("race_winners/$season/$championId")
                                }
                            )
                        }
                        
                        composable(
                            route = "race_winners/{season}/{championId}",
                            arguments = listOf(
                                navArgument("season") {
                                    type = NavType.StringType
                                },
                                navArgument("championId") {
                                    type = NavType.StringType
                                }
                            )
                        ) {
                            RaceWinnersScreen(
                                onBackClick = {
                                    navController.popBackStack()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
} 