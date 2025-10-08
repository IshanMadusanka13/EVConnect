package com.evcharging.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton object for Retrofit client configuration
 * Manages HTTP client and API service instance
 */
object RetrofitClient {
    
    // Base URL for your .NET backend API
    // Change this to your actual server URL
    private const val BASE_URL = "http://192.168.56.1:5116/api/" // For Android phone
    // For Android emulator, use: "http://10.0.2.2:5116/api/"
    
    /**
     * Configure HTTP logging interceptor for debugging
     * Logs all HTTP requests and responses
     */
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    /**
     * Configure OkHttp client with interceptors and timeouts
     */
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    /**
     * Retrofit instance with Gson converter
     * Converts JSON responses to Kotlin objects automatically
     */
    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    /**
     * API service instance
     * Provides access to all API endpoints
     */
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}