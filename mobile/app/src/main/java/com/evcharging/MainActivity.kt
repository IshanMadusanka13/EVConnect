package com.evcharging

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.ui.users.CreateUserActivity
import com.evcharging.ui.users.UpdateUserActivity
import com.evcharging.ui.users.DeactivateUserActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnCreateUser).setOnClickListener {
            startActivity(Intent(this, CreateUserActivity::class.java))
        }

        findViewById<Button>(R.id.btnUpdateUser).setOnClickListener {
            startActivity(Intent(this, UpdateUserActivity::class.java))
        }

        findViewById<Button>(R.id.btnDeactivateUser).setOnClickListener {
            startActivity(Intent(this, DeactivateUserActivity::class.java))
        }
    }
}
