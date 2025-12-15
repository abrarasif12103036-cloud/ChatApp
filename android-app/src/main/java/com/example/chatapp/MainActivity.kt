package com.example.chatapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class MainActivity : AppCompatActivity() {

    private lateinit var messageList: RecyclerView
    private lateinit var messageInput: EditText
    private lateinit var sendButton: Button

    private val messages = mutableListOf<Message>()
    private lateinit var messageAdapter: MessageAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        messageList = findViewById(R.id.message_list)
        messageInput = findViewById(R.id.message_input)
        sendButton = findViewById(R.id.send_button)

        messageAdapter = MessageAdapter(messages)
        messageList.adapter = messageAdapter
        messageList.layoutManager = LinearLayoutManager(this)

        sendButton.setOnClickListener {
            val messageText = messageInput.text.toString()
            if (messageText.isNotEmpty()) {
                val message = Message(messageText)
                messages.add(message)
                messageAdapter.notifyItemInserted(messages.size - 1)
                messageInput.text.clear()
            }
        }
    }
}