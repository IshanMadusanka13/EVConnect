package com.evcharging

import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.ui.users.CreateUserActivity
import com.evcharging.ui.users.UpdateUserActivity
import com.evcharging.ui.users.DeactivateUserActivity
import com.evcharging.ui.users.DeleteUserActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Create User Card
        findViewById<LinearLayout>(R.id.btnCreateUser).setOnClickListener {
            startActivity(Intent(this, CreateUserActivity::class.java))
        }

        // Update User Card
        findViewById<LinearLayout>(R.id.btnUpdateUser).setOnClickListener {
            startActivity(Intent(this, UpdateUserActivity::class.java))
        }

        // Deactivate User Card
        findViewById<LinearLayout>(R.id.btnDeactivateUser).setOnClickListener {
            startActivity(Intent(this, DeactivateUserActivity::class.java))
        }

        // Delete User Card
        findViewById<LinearLayout>(R.id.btnDeleteUser).setOnClickListener {
            startActivity(Intent(this, DeleteUserActivity::class.java))
        }
    }
}