package com.evcharging.ui.users

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.*

class DeactivateUserActivity : AppCompatActivity() {
    private lateinit var repo: EVOwnerRepository
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_deactivate_user)

        repo = EVOwnerRepository(this)

        val etNIC = findViewById<EditText>(R.id.etNIC)
        val btnDeactivate = findViewById<Button>(R.id.btnDeactivate)

        btnDeactivate.setOnClickListener {
            val nic = etNIC.text.toString()
            val success = repo.deactivateLocal(nic)
            if (success) {
                Toast.makeText(this, "Deactivated locally", Toast.LENGTH_SHORT).show()
                scope.launch { repo.deactivateRemote(nic) }
            } else {
                Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
