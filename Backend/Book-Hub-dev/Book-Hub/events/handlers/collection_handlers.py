import boto3
import json

client = boto3.client('events')

def handle_collection_created(event):
    """Handle the collection created event."""
    response = client.put_events(
        Entries=[
            {
                'Source': 'com.bookhub',
                'DetailType': 'CollectionCreated',
                'Detail': json.dumps(event),
                'EventBusName': 'BookhubEventBus'
            }
        ]
    )
    print(f"Collection created event published: {response}")

def handle_collection_deleted(event):
    """Handle the collection deleted event."""
    response = client.put_events(
        Entries=[
            {
                'Source': 'com.bookhub',
                'DetailType': 'CollectionDeleted',
                'Detail': json.dumps(event),
                'EventBusName': 'BookhubEventBus'
            }
        ]
    )
    print(f"Collection deleted event published: {response}")